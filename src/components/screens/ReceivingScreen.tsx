import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Truck, 
  Scale, 
  Clock, 
  Camera, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Sparkles,
  Thermometer,
  Tag,
  CheckCircle2,
  Calendar,
  UploadCloud,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { 
  Dapur, 
  Vendor, 
  Komoditas, 
  PenerimaanBahanItem,
  TabType 
} from '../../types';
import { getTodayDateStr, getTomorrowDateStr, formatDateIndo } from '../../utils/dateUtils';
import { 
  uploadPhotoToGoogleDrive, 
  generateBahanPhotoFileName, 
  GDRIVE_BAHAN_FOLDER_URL 
} from '../../utils/googleDrive';

// Quick recommendation chips for retur reasons
const quickReturReasons = [
  'Bau asam/busuk/rusak',
  'Fisik layu/kualitas buruk',
  'Suhu peti di atas batas HACCP',
  'Timbangan susut berlebih',
  'Salah spesifikasi komoditas'
];

interface ReceivingScreenProps {
  currentDapur: Dapur;
  selectedDate?: string;
  picName?: string;
  vendors: Vendor[];
  availableKomoditas: Komoditas[];
  penerimaanItems: PenerimaanBahanItem[];
  onSaveBahanItem: (item: PenerimaanBahanItem) => void;
  onDeleteBahanItem?: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const ReceivingScreen: React.FC<ReceivingScreenProps> = ({
  currentDapur,
  picName = 'Petugas PIC',
  vendors,
  availableKomoditas,
  penerimaanItems,
  onSaveBahanItem,
  onDeleteBahanItem,
  onNavigateTab
}) => {
  // Helper for current HH:mm
  const getCurrentTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Tanggal penerimaan otomatis diisi hari ini (real-time)
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // Tanggal menu peruntukan diisi di bagian bawah sebelum submit (default: Besok karena pengiriman H-1)
  const [tanggalMenu, setTanggalMenu] = useState<string>(tomorrowStr);

  const [namaBahanBaku, setNamaBahanBaku] = useState<string>('');
  const [namaSupplier, setNamaSupplier] = useState<string>(() => {
    return currentDapur.vendor_default_id === 'vnd-ud-bisukma' 
      ? 'UD Bisukma Sejahtera (Koperasi Yayasan)' 
      : (vendors[0]?.nama || '');
  });
  const [jumlahSampai, setJumlahSampai] = useState<string>('');
  const [satuan, setSatuan] = useState<string>('Kg');
  const [jamSampai, setJamSampai] = useState<string>(getCurrentTimeString);

  // Retur section
  const [adaRetur, setAdaRetur] = useState<boolean>(false);
  const [jumlahRetur, setJumlahRetur] = useState<string>('');
  const [alasanRetur, setAlasanRetur] = useState<string>('');
  const [jamSampaiRetur, setJamSampaiRetur] = useState<string>('');

  // Cold-chain & optional details
  const [suhuCelsius, setSuhuCelsius] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoUploadNotice, setPhotoUploadNotice] = useState<string | null>(null);

  // Feed filter (tanggal terpilih vs semua)
  const [feedFilter, setFeedFilter] = useState<'terpilih' | 'semua'>('terpilih');

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Auto-generate standardized file name
    const autoFileName = generateBahanPhotoFileName({
      isRetur: adaRetur,
      tanggal: todayStr,
      kodeDapur: currentDapur.kode_bgn,
      namaBahan: namaBahanBaku.trim() || 'Bahan',
      jamSampai: jamSampai,
      photoIndex: photos.length + 1
    });

    setIsUploadingPhoto(true);
    setPhotoUploadNotice(`Mengunggah ke Drive: ${autoFileName}...`);

    try {
      const uploadRes = await uploadPhotoToGoogleDrive(
        file,
        autoFileName,
        undefined,
        `Bukti Penerimaan SPPG ${currentDapur.nama} - ${namaBahanBaku || 'Bahan Baku'}`
      );
      // Use webViewLink or direct download URL
      const finalUrl = uploadRes.webViewLink || uploadRes.downloadUrl;
      if (finalUrl) {
        setPhotos(prev => [...prev, finalUrl]);
        setPhotoUploadNotice(`Tersimpan di Google Drive (${autoFileName})`);
      }
    } catch (err: any) {
      console.warn('Google Drive direct upload fallback to local base64 preview:', err);
      // Fallback to local base64 so user is never blocked in field
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
      setPhotoUploadNotice(`Tersimpan lokal (${autoFileName})`);
    } finally {
      setIsUploadingPhoto(false);
      setTimeout(() => {
        setPhotoUploadNotice(null);
      }, 4000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaBahanBaku.trim()) {
      alert('Mohon isi nama bahan baku.');
      return;
    }
    if (!namaSupplier.trim()) {
      alert('Mohon isi nama supplier / pengirim.');
      return;
    }
    const berat = parseFloat(jumlahSampai);
    if (isNaN(berat) || berat <= 0) {
      alert('Mohon masukkan jumlah sampai yang valid (> 0).');
      return;
    }

    const returKg = adaRetur ? parseFloat(jumlahRetur) : undefined;
    const suhu = suhuCelsius ? parseFloat(suhuCelsius) : undefined;

    const newItem: PenerimaanBahanItem = {
      id: `RCV-ITM-${Date.now()}`,
      dapur_id: currentDapur.id,
      dapur_nama: currentDapur.nama,
      tanggal: todayStr,
      tanggal_menu: tanggalMenu,
      nama_bahan_baku: namaBahanBaku.trim(),
      nama_supplier: namaSupplier.trim(),
      jumlah_sampai: berat,
      satuan,
      jam_sampai: jamSampai,
      ada_retur: adaRetur,
      jumlah_retur: returKg,
      alasan_retur: adaRetur ? (alasanRetur || 'Retur bahan tidak layak') : undefined,
      jam_sampai_retur: adaRetur && jamSampaiRetur ? jamSampaiRetur : undefined,
      suhu_celsius: suhu,
      foto_urls: photos,
      catatan: catatan.trim() || undefined,
      pic_nama: picName,
      created_at: new Date().toISOString()
    };

    onSaveBahanItem(newItem);
    setFeedbackSuccess(`Berhasil mencatat penerimaan: ${newItem.nama_bahan_baku} (${newItem.jumlah_sampai} ${newItem.satuan}) untuk Menu ${formatDateIndo(tanggalMenu, { withDayName: false })}`);
    
    // Reset form for next item upload
    setNamaBahanBaku('');
    setJumlahSampai('');
    setAdaRetur(false);
    setJumlahRetur('');
    setAlasanRetur('');
    setJamSampaiRetur('');
    setSuhuCelsius('');
    setCatatan('');
    setPhotos([]);
    setJamSampai(getCurrentTimeString());
    setTanggalMenu(tomorrowStr);

    setTimeout(() => {
      setFeedbackSuccess(null);
    }, 3500);
  };

  // Filter items for bottom feed
  const itemsToday = penerimaanItems.filter(i => i.tanggal === todayStr);
  const displayedItems = feedFilter === 'terpilih' ? itemsToday : penerimaanItems;

  return (
    <div className="space-y-5 pb-24 lg:pb-12 max-w-2xl mx-auto">
      
      {/* Success Notification */}
      {feedbackSuccess && (
        <div className="p-4 bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F3F4F6]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Laporan Penerimaan Satuan
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#111827]">
              Input Bahan Baku (1 per 1)
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Tgl Penerimaan: {formatDateIndo(todayStr)} (Otomatis)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F9FF] text-[#0369A1] border border-[#0369A1]/20">
              <Clock className="w-3.5 h-3.5" />
              {jamSampai} WIB
            </span>
          </div>
        </div>
        <p className="text-xs text-[#6B7280]">
          Setiap bahan baku yang tiba ditimbang dan dilaporkan satu per satu secara langsung saat armada selesai bongkar muat.
        </p>
      </div>

      {/* Main Single Item Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-2xs space-y-4">
        
        {/* 1. Nama Bahan Baku */}
        <div>
          <label htmlFor="input-nama-bahan" className="text-xs font-bold text-[#111827] block mb-1">
            1. Nama Bahan Baku <span className="text-red-600">*</span>
          </label>
          <input
            id="input-nama-bahan"
            name="nama_bahan_baku"
            type="text"
            required
            value={namaBahanBaku}
            onChange={(e) => setNamaBahanBaku(e.target.value)}
            placeholder="Ketik nama bahan (contoh: Daging Ayam, Wortel, Telur...)"
            className="w-full text-sm font-bold bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3.5 py-3 text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* 2. Nama Supplier */}
        <div>
          <label htmlFor="input-nama-supplier" className="text-xs font-bold text-[#111827] block mb-1">
            2. Nama Supplier / Pengirim <span className="text-red-600">*</span>
          </label>
          <input
            id="input-nama-supplier"
            name="nama_supplier"
            type="text"
            required
            value={namaSupplier}
            onChange={(e) => setNamaSupplier(e.target.value)}
            placeholder="Ketik nama supplier / pengirim..."
            className="w-full text-xs font-bold bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* 3. Jumlah Sampai & Satuan + 4. Jam Sampai */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Jumlah Sampai */}
          <div className="bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E5E7EB]">
            <label htmlFor="input-jumlah-sampai" className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
              3. Jumlah Sampai (Timbangan) <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-jumlah-sampai"
                name="jumlah_sampai"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={jumlahSampai}
                onChange={(e) => setJumlahSampai(e.target.value)}
                placeholder="0.0"
                className="w-full text-[28px] leading-[34px] font-black text-[#111827] tracking-tight bg-transparent border-b border-dashed border-gray-300 focus:border-[#111827] focus:outline-none"
              />
              <select
                id="select-satuan"
                name="satuan"
                aria-label="Satuan Timbangan"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
              >
                <option value="Kg">Kg</option>
                <option value="Ikat">Ikat</option>
                <option value="Butir">Butir</option>
                <option value="Liter">Liter</option>
                <option value="Dus">Dus</option>
              </select>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-200/60">
              {[0.5, 1, 5, 10].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(jumlahSampai) || 0;
                    setJumlahSampai((current + step).toFixed(1));
                  }}
                  className="flex-1 py-1 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 active:scale-95"
                >
                  +{step}
                </button>
              ))}
            </div>
          </div>

          {/* Jam Sampai */}
          <div className="bg-[#F9FAFB] p-3.5 rounded-xl border border-[#E5E7EB] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-jam-sampai" className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  4. Jam Sampai <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setJamSampai(getCurrentTimeString())}
                  className="text-[10px] text-sky-700 font-bold hover:underline cursor-pointer"
                >
                  Set Sekarang
                </button>
              </div>
              <input
                id="input-jam-sampai"
                name="jam_sampai"
                type="time"
                required
                value={jamSampai}
                onChange={(e) => setJamSampai(e.target.value)}
                className="w-full text-lg font-bold bg-white border border-gray-300 rounded-xl px-3 py-2 text-[#111827] focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Suhu Peti Chiller (Opsional) */}
            <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
              <label htmlFor="input-suhu-peti" className="text-[11px] text-gray-600 font-semibold flex items-center gap-1 cursor-pointer">
                <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                Suhu Peti (°C)
              </label>
              <input
                id="input-suhu-peti"
                name="suhu_celsius"
                type="number"
                step="0.1"
                value={suhuCelsius}
                onChange={(e) => setSuhuCelsius(e.target.value)}
                placeholder="3.5"
                className="w-16 text-xs font-bold text-right bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800"
              />
            </div>
          </div>

        </div>

        {/* 5. Retur (jika ada) & 6. Jam Sampai Retur */}
        <div className={`rounded-xl border p-3.5 transition-all ${
          adaRetur 
            ? 'bg-red-50/60 border-red-300' 
            : 'bg-[#F9FAFB] border-[#E5E7EB]'
        }`}>
          <div className="flex items-center justify-between">
            <label htmlFor="checkbox-ada-retur" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-ada-retur"
                name="ada_retur"
                type="checkbox"
                checked={adaRetur}
                onChange={(e) => setAdaRetur(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
              />
              <span className={`text-xs font-bold ${adaRetur ? 'text-red-900' : 'text-[#374151]'}`}>
                5. Ada Retur / Bahan Ditolak?
              </span>
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              adaRetur ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-600'
            }`}>
              {adaRetur ? 'ADA RETUR' : 'TIDAK ADA'}
            </span>
          </div>

          {/* Retur Details Accordion */}
          {adaRetur && (
            <div className="mt-3 pt-3 border-t border-red-200 space-y-3 animate-fadeIn text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Jumlah Retur */}
                <div>
                  <label htmlFor="input-jumlah-retur" className="font-bold text-red-900 block mb-1">
                    Jumlah yang Diretur ({satuan}) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="input-jumlah-retur"
                    name="jumlah_retur"
                    type="number"
                    step="0.1"
                    min="0.1"
                    required={adaRetur}
                    value={jumlahRetur}
                    onChange={(e) => setJumlahRetur(e.target.value)}
                    placeholder="Contoh: 2.0"
                    className="w-full font-bold bg-white border border-red-300 rounded-xl px-3 py-2 text-red-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* 6. Jam Sampai Retur */}
                <div>
                  <label htmlFor="input-jam-retur" className="font-bold text-red-900 block mb-1">
                    6. Jam Sampai Retur (Pengganti Tiba)
                  </label>
                  <input
                    id="input-jam-retur"
                    name="jam_sampai_retur"
                    type="time"
                    value={jamSampaiRetur}
                    onChange={(e) => setJamSampaiRetur(e.target.value)}
                    className="w-full font-bold bg-white border border-red-300 rounded-xl px-3 py-2 text-red-900 focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[10px] text-red-700 mt-0.5 block">
                    Jam berapa bahan pengganti yang baik tiba di dapur
                  </span>
                </div>

              </div>

              {/* Alasan Retur */}
              <div>
                <label htmlFor="input-alasan-retur" className="font-bold text-red-900 block mb-1">
                  Alasan Retur / Kerusakan
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {quickReturReasons.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAlasanRetur(chip)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        alasanRetur === chip
                          ? 'bg-red-700 text-white border-red-700 font-bold'
                          : 'bg-white text-red-800 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <input
                  id="input-alasan-retur"
                  name="alasan_retur"
                  type="text"
                  value={alasanRetur}
                  onChange={(e) => setAlasanRetur(e.target.value)}
                  placeholder="Keterangan kondisi fisik barang yang ditolak..."
                  className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-red-900 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* 7. Foto Bukti (Google Drive BAHAN_BAKU) */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label htmlFor="input-upload-foto" className="text-xs font-bold text-[#111827] cursor-pointer">
              Foto Bukti (Timbangan / Fisik Bahan / Nota)
            </label>
            <a 
              href={GDRIVE_BAHAN_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-sky-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Folder Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {photoUploadNotice && (
            <div className="mb-2 p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold flex items-center gap-1.5 animate-fadeIn">
              {isUploadingPhoto ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="truncate">{photoUploadNotice}</span>
            </div>
          )}

          <input
            id="input-upload-foto"
            name="upload_foto"
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
            aria-label="Upload Foto Bukti"
          />

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {/* Take Photo Button */}
            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className={`w-16 h-16 rounded-xl border border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-1 text-gray-600 transition-colors shrink-0 cursor-pointer min-h-[48px] ${
                isUploadingPhoto ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              {isUploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
              ) : (
                <Camera className="w-5 h-5 text-gray-700" />
              )}
              <span className="text-[9px] font-bold">
                {isUploadingPhoto ? 'Unggah...' : 'Kamera'}
              </span>
            </button>

            {/* Photo Previews */}
            {photos.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500 shrink-0 group">
                <img src={url} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Catatan Opsional */}
        <div>
          <label htmlFor="input-catatan" className="text-xs font-bold text-gray-700 block mb-1">
            7. Catatan Tambahan (Opsional)
          </label>
          <input
            id="input-catatan"
            name="catatan"
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan sopir, kondisi cuaca, atau nomor nota..."
            className="w-full text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* 8. Peruntukan Tanggal Menu SPPG (Diisi sebelum submit) */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="input-tanggal-menu" className="text-xs font-bold text-amber-950 flex items-center gap-1.5 cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              8. Peruntukan Tanggal Menu SPPG <span className="text-red-600">*</span>
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
              {tanggalMenu === tomorrowStr ? 'Menu Besok (H-1)' : tanggalMenu === todayStr ? 'Menu Hari Ini' : 'Jadwal Menu Khusus'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTanggalMenu(tomorrowStr)}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] ${
                tanggalMenu === tomorrowStr
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-100/50'
              }`}
            >
              <span>Besok (H-1 Menu)</span>
            </button>

            <button
              type="button"
              onClick={() => setTanggalMenu(todayStr)}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] ${
                tanggalMenu === todayStr
                  ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <span>Hari Ini (Menu Hari H)</span>
            </button>

            <input
              id="input-tanggal-menu"
              name="tanggal_menu"
              type="date"
              required
              value={tanggalMenu}
              onChange={(e) => setTanggalMenu(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-[#111827] focus:outline-none focus:border-amber-600 cursor-pointer min-h-[38px]"
            />
          </div>

          <p className="text-[10px] text-amber-900/80 leading-tight">
            Pengiriman bahan baku biasanya tiba H-1 sebelum hari penyajian. Pilih tanggal menu yang akan dimasak dengan bahan ini.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#111827] text-white hover:bg-black rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Simpan Laporan Bahan Ini</span>
        </button>

      </form>

      {/* Feed Laporan Bahan Masuk */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              Laporan Bahan Masuk ({displayedItems.length} Item)
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              {feedFilter === 'terpilih' 
                ? `Arsip penerimaan hari ini: ${formatDateIndo(todayStr)}`
                : 'Menampilkan seluruh arsip penerimaan bahan di dapur'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFeedFilter('terpilih')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                feedFilter === 'terpilih'
                  ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Hari Ini ({itemsToday.length})
            </button>
            <button
              type="button"
              onClick={() => setFeedFilter('semua')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                feedFilter === 'semua'
                  ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Semua ({penerimaanItems.length})
            </button>
          </div>
        </div>

        {displayedItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
            <Scale className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
            <p className="text-xs font-medium">Belum ada bahan baku yang diinput hari ini.</p>
            <button
              type="button"
              onClick={() => setFeedFilter('semua')}
              className="mt-2 text-xs font-bold text-sky-700 hover:underline cursor-pointer"
            >
              Lihat Laporan Tanggal Lain ({penerimaanItems.length} item)
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[#111827]">
                      {item.nama_bahan_baku}
                    </h4>
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      Terima: {item.tanggal === todayStr ? 'Hari Ini' : item.tanggal}
                    </span>
                    {item.tanggal_menu && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                        Menu: {formatDateIndo(item.tanggal_menu, { withDayName: false })}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-gray-500">
                      • {item.jam_sampai} WIB
                    </span>
                    {item.ada_retur && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        RETUR: {item.jumlah_retur} {item.satuan}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-gray-600 mt-0.5">
                    Supplier: <strong className="text-gray-900">{item.nama_supplier}</strong>
                  </p>

                  {item.ada_retur && (
                    <div className="mt-1 text-[11px] text-red-800 bg-red-50 px-2 py-1 rounded-lg">
                      Alasan: {item.alasan_retur} {item.jam_sampai_retur ? `(Pengganti tiba: ${item.jam_sampai_retur} WIB)` : ''}
                    </div>
                  )}

                  {item.catatan && (
                    <p className="text-[11px] text-gray-500 italic mt-0.5">
                      "{item.catatan}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-base sm:text-lg font-black text-[#111827]">
                      {item.jumlah_sampai} {item.satuan}
                    </span>
                    {item.suhu_celsius && (
                      <span className="text-[11px] text-emerald-700 block font-semibold">
                        Suhu: {item.suhu_celsius}°C
                      </span>
                    )}
                  </div>

                  {onDeleteBahanItem && (
                    <button
                      type="button"
                      onClick={() => onDeleteBahanItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
