import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  X, 
  Package, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Calendar,
  Layers,
  Wrench,
  ShieldCheck,
  Flame,
  Refrigerator,
  Truck
} from 'lucide-react';
import { Dapur, InventarisItem } from '../../types';
import { saveDocument } from '../../lib/firebase';

interface FormInputAsetTersediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDapur: Dapur;
  picName: string;
  onSaveSuccess: (savedItem: InventarisItem) => void;
  itemToEdit?: InventarisItem | null;
}

export const KATEGORI_INVENTARIS_OPTIONS = [
  'Alat Masak & Prep',
  'Equipment Listrik & Dingin',
  'Wadah Ompreng & Distribusi',
  'Meubelair & Rak Stainless',
  'Alat Kebersihan & Sanitasi',
  'Logistik & Transportasi'
];

export const SATUAN_INVENTARIS_OPTIONS = [
  { value: 'Unit', label: 'Unit (Alat / Mesin / Inventaris)' },
  { value: 'Buah', label: 'Buah' },
  { value: 'Set', label: 'Set' },
  { value: 'Pcs', label: 'Pcs' },
  { value: 'Paket', label: 'Paket' },
  { value: 'Lainnya', label: 'Lainnya (Ketik Manual...)' }
];

export const FormInputAsetTersediaModal: React.FC<FormInputAsetTersediaModalProps> = ({
  isOpen,
  onClose,
  currentDapur,
  picName,
  onSaveSuccess,
  itemToEdit
}) => {
  // Mode Selection: Saldo Awal / Data Lama (PIC Mode) vs Pembelian Baru (ERP Desktop Only)
  const [entryMode, setEntryMode] = useState<'saldo_awal_lama' | 'pembelian_baru'>('saldo_awal_lama');

  // Section 1: Identitas & Spesifikasi
  const [namaBarang, setNamaBarang] = useState('');
  const [kategori, setKategori] = useState(KATEGORI_INVENTARIS_OPTIONS[0]);
  const [spesifikasi, setSpesifikasi] = useState('');
  const [kodeAsetManual, setKodeAsetManual] = useState('');

  // Section 2: Lokasi & Catatan Simpel PIC
  const [catatanSimpel, setCatatanSimpel] = useState('');

  // Section 3: Kuantitas & Rincian Fisik
  const [jumlahBarang, setJumlahBarang] = useState<number>(1);
  const [satuan, setSatuan] = useState('Unit');
  const [customSatuan, setCustomSatuan] = useState('');
  const [kondisiBaik, setKondisiBaik] = useState<number>(1);
  const [kondisiRusakRingan, setKondisiRusakRingan] = useState<number>(0);
  const [kondisiRusakBerat, setKondisiRusakBerat] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-sync condition when jumlahBarang changes
  const handleJumlahBarangChange = (val: number) => {
    const nextQty = Math.max(1, isNaN(val) ? 1 : val);
    setJumlahBarang(nextQty);
    const totalRusak = kondisiRusakRingan + kondisiRusakBerat;
    setKondisiBaik(Math.max(0, nextQty - totalRusak));
  };

  const handleRusakRinganChange = (val: number) => {
    const parsed = Math.max(0, isNaN(val) ? 0 : val);
    const clamped = Math.min(parsed, Math.max(0, jumlahBarang - kondisiRusakBerat));
    setKondisiRusakRingan(clamped);
    setKondisiBaik(Math.max(0, jumlahBarang - (clamped + kondisiRusakBerat)));
  };

  const handleRusakBeratChange = (val: number) => {
    const parsed = Math.max(0, isNaN(val) ? 0 : val);
    const clamped = Math.min(parsed, Math.max(0, jumlahBarang - kondisiRusakRingan));
    setKondisiRusakBerat(clamped);
    setKondisiBaik(Math.max(0, jumlahBarang - (kondisiRusakRingan + clamped)));
  };

  const handleKondisiBaikChange = (val: number) => {
    const parsed = Math.max(0, isNaN(val) ? 0 : val);
    const clamped = Math.min(parsed, jumlahBarang);
    setKondisiBaik(clamped);
  };

  // Reset or pre-populate form when opened or when itemToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setNamaBarang(itemToEdit.nama_barang || '');
        setKategori(itemToEdit.kategori || KATEGORI_INVENTARIS_OPTIONS[0]);
        setSpesifikasi(itemToEdit.spesifikasi || '');
        setKodeAsetManual(itemToEdit.kode_aset || '');
        setCatatanSimpel(itemToEdit.catatan || '');
        setJumlahBarang(itemToEdit.total_kuantitas_pcs || 1);

        const knownSatuan = ['Unit', 'Buah', 'Set', 'Pcs', 'Paket'];
        if (itemToEdit.satuan && knownSatuan.includes(itemToEdit.satuan)) {
          setSatuan(itemToEdit.satuan);
          setCustomSatuan('');
        } else if (itemToEdit.satuan) {
          setSatuan('Lainnya');
          setCustomSatuan(itemToEdit.satuan);
        } else {
          setSatuan('Unit');
          setCustomSatuan('');
        }

        setKondisiBaik(itemToEdit.kondisi_baik_pcs ?? itemToEdit.total_kuantitas_pcs ?? 1);
        setKondisiRusakRingan(itemToEdit.kondisi_rusak_ringan_pcs ?? 0);
        setKondisiRusakBerat(itemToEdit.kondisi_rusak_berat_pcs ?? 0);
      } else {
        setNamaBarang('');
        setKategori(KATEGORI_INVENTARIS_OPTIONS[0]);
        setSpesifikasi('');
        setKodeAsetManual('');
        setCatatanSimpel('');
        setJumlahBarang(1);
        setSatuan('Unit');
        setCustomSatuan('');
        setKondisiBaik(1);
        setKondisiRusakRingan(0);
        setKondisiRusakBerat(0);
      }
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const totalKondisiFisik = kondisiBaik + kondisiRusakRingan + kondisiRusakBerat;
  const isConditionBalanced = totalKondisiFisik === jumlahBarang;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!namaBarang.trim()) {
      setFormError('Nama barang / peralatan wajib diisi.');
      return;
    }

    if (jumlahBarang < 1) {
      setFormError('Jumlah barang minimal 1 unit.');
      return;
    }

    if (!isConditionBalanced) {
      setFormError(`Total rincian kondisi fisik (${totalKondisiFisik}) harus sama dengan jumlah total barang (${jumlahBarang}).`);
      return;
    }

    const effectiveSatuan = satuan === 'Lainnya' ? (customSatuan.trim() || 'Unit') : satuan;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const bulanTahun = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const randCode = String(Math.floor(100 + Math.random() * 900));
      const kodeAsetFinal = kodeAsetManual.trim() || `AST-${currentDapur.kode_bgn || 'DAPUR'}-${currentYear}-${randCode}`;

      if (itemToEdit) {
        // Edit existing inventory item
        const updatedItem: InventarisItem = {
          ...itemToEdit,
          kode_aset: kodeAsetManual.trim() || itemToEdit.kode_aset,
          nama_barang: namaBarang.trim(),
          spesifikasi: spesifikasi.trim() || undefined,
          kategori: kategori,
          satuan: effectiveSatuan,
          kuantitas_satuan: jumlahBarang,
          total_kuantitas_pcs: jumlahBarang,
          kondisi_baik_pcs: kondisiBaik,
          kondisi_rusak_ringan_pcs: kondisiRusakRingan,
          kondisi_rusak_berat_pcs: kondisiRusakBerat,
          catatan: catatanSimpel.trim() || itemToEdit.catatan,
          last_inspected_at: now.toISOString().split('T')[0],
          last_inspected_by: picName,
          last_inspected_status: (kondisiRusakRingan > 0 || kondisiRusakBerat > 0) ? 'kendala' : 'normal',
          riwayat_alur: [
            ...(itemToEdit.riwayat_alur || []),
            {
              id: `alr-${Date.now()}`,
              tanggal: now.toISOString().split('T')[0],
              tipe_event: 'pembelian_yayasan',
              judul: 'Pembaruan Data Aset Dapur',
              deskripsi: `Pembaruan data dan kondisi fisik aset oleh PIC (${picName}): ${jumlahBarang} ${effectiveSatuan}.`,
              aktor_nama: picName,
              aktor_role: 'PIC Dapur SPPG',
              lokasi_asal: currentDapur.nama,
              lokasi_tujuan: currentDapur.nama,
              jumlah_pcs: jumlahBarang,
              catatan: catatanSimpel.trim() || undefined
            }
          ]
        };

        try {
          await saveDocument('inventaris', itemToEdit.id, updatedItem);
        } catch (saveErr) {
          console.warn('Sync Firestore inventaris offline fallback:', saveErr);
        }

        onSaveSuccess(updatedItem);
        onClose();
        return;
      }

      // Create new inventory item
      const uniqueId = `inv-${Date.now()}`;
      const newItem: InventarisItem = {
        id: uniqueId,
        kode_aset: kodeAsetFinal,
        lokasi_sekarang: 'sppg',
        dapur_id: currentDapur.id,
        dapur_nama: currentDapur.nama,
        nama_barang: namaBarang.trim(),
        spesifikasi: spesifikasi.trim() || undefined,
        kategori: kategori,
        bulan_tahun_pengadaan: bulanTahun,
        tanggal_pembelian: '', // Akan dilengkapi Tim ERP Desktop
        nomor_po_faktur: '', // Akan dilengkapi Tim ERP Desktop
        kode_bast_terakhir: '', // Akan dilengkapi Tim ERP Desktop
        supplier_toko: '', // Akan dilengkapi Tim ERP Desktop
        satuan: effectiveSatuan,
        kuantitas_satuan: jumlahBarang,
        konversi_pcs: 1,
        total_kuantitas_pcs: jumlahBarang,
        harga_satuan_rp: 0, // Akan dilengkapi Tim ERP Desktop
        total_harga_rp: 0, // Akan dilengkapi Tim ERP Desktop
        status_aset: 'di_sppg',
        kondisi_baik_pcs: kondisiBaik,
        kondisi_rusak_ringan_pcs: kondisiRusakRingan,
        kondisi_rusak_sedang_pcs: 0,
        kondisi_rusak_berat_pcs: kondisiRusakBerat,
        catatan: catatanSimpel.trim() || `Aset dicatat oleh PIC (${picName}) di ${currentDapur.nama}`,
        created_at: now.toISOString(),
        last_inspected_at: now.toISOString().split('T')[0],
        last_inspected_by: picName,
        last_inspected_status: (kondisiRusakRingan > 0 || kondisiRusakBerat > 0) ? 'kendala' : 'normal',
        riwayat_alur: [
          {
            id: `alr-${Date.now()}`,
            tanggal: now.toISOString().split('T')[0],
            tipe_event: 'pembelian_yayasan',
            judul: 'Pencatatan Saldo Awal Aset Dapur',
            deskripsi: `Pencatatan fisik aset yang sudah tersedia di ${currentDapur.nama} sebanyak ${jumlahBarang} ${effectiveSatuan}. Data administratif akan diverifikasi oleh Tim ERP Desktop Yayasan.`,
            aktor_nama: picName,
            aktor_role: 'PIC Dapur SPPG',
            lokasi_asal: currentDapur.nama,
            lokasi_tujuan: currentDapur.nama,
            jumlah_pcs: jumlahBarang,
            catatan: catatanSimpel.trim() || undefined
          }
        ]
      };

      // Save to Firestore collection 'inventaris' with resilient offline fallback
      try {
        await saveDocument('inventaris', newItem.id, newItem);
      } catch (saveErr) {
        console.warn('Sync Firestore inventaris offline fallback:', saveErr);
      }

      onSaveSuccess(newItem);
      onClose();
    } catch (err: unknown) {
      console.error('Error saving inventaris item:', err);
      setFormError('Gagal memproses data aset. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl my-auto flex flex-col overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#111827] text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {itemToEdit ? 'Edit & Perbarui Data Aset' : 'Pencatatan & Inventarisasi Aset'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
                {itemToEdit ? `Perbarui informasi aset di ${currentDapur.nama}` : `Input aset fisik yang sudah tersedia di ${currentDapur.nama}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-close-modal-input-aset"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Matching reference mockup) */}
        <div className="bg-gray-50 p-3 sm:px-6 border-b border-gray-200 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-gray-200/70 p-1 rounded-xl">
            <button
              type="button"
              disabled
              title="Pengadaan baru dari supplier diinput oleh Tim ERP Desktop"
              className="px-3 py-2 rounded-lg text-xs font-bold text-gray-400 flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
            >
              <span>🛒 Pembelian Baru (Gudang)</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-gray-300 text-gray-700">ERP</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('saldo_awal_lama')}
              className="px-3 py-2 rounded-lg text-xs font-bold bg-white text-gray-900 shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>📦 Saldo Awal / Data Lama</span>
            </button>
          </div>

          <div className="mt-2.5 px-3 py-2 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong>Mode PIC Dapur:</strong> Catat peralatan fisik yang sudah ada di dapur Anda. Tanggal pembelian resmi, BAST, dan nominal harga perolehan akan dilengkapi oleh Tim ERP Desktop Yayasan.
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Identitas & Spesifikasi Barang */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 pb-1 border-b border-gray-100">
              <Package className="w-4 h-4 text-blue-600" />
              <span>1. Identitas & Spesifikasi Barang</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Nama Barang / Peralatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-nama-barang"
                  placeholder="Contoh: Kompor Gas Komersial 2 Tungku"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kategori Inventaris <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="select-kategori-inventaris"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {KATEGORI_INVENTARIS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Spesifikasi Teknis / Merk / Dimensi
                </label>
                <input
                  type="text"
                  data-testid="input-spesifikasi"
                  placeholder="Contoh: Rinnai RI-522E, 2 Tungku Kuningan SUS 304"
                  value={spesifikasi}
                  onChange={(e) => setSpesifikasi(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kode Aset (Opsional)
                </label>
                <input
                  type="text"
                  data-testid="input-kode-aset"
                  placeholder="Contoh: AST-1 atau kosongkan (otomatis)"
                  value={kodeAsetManual}
                  onChange={(e) => setKodeAsetManual(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Kosongkan jika belum memiliki nomor plat aset dari yayasan.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Penempatan Lokasi & Tanggal Pembelian */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 pb-1 border-b border-gray-100">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>2. Penempatan Lokasi & Catatan PIC</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Lokasi Keberadaan Aset <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 text-xs font-semibold">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{currentDapur.nama}</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                    Terkunci
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kelengkapan Faktur / BAST
                </label>
                <div className="px-3.5 py-2 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight flex items-center gap-2 min-h-[42px]">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Dilengkapi kemudian oleh Tim ERP Desktop Yayasan</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Catatan Simpel PIC (Riwayat / Kondisi Awal)
                </label>
                <textarea
                  rows={2}
                  data-testid="input-catatan-simpel"
                  placeholder="Contoh: Sudah digunakan sejak awal dapur beroperasi, kondisi kompor normal dan siap pakai."
                  value={catatanSimpel}
                  onChange={(e) => setCatatanSimpel(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Kuantitas, Nilai & Rincian Kondisi Fisik */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>3. Kuantitas & Rincian Kondisi Fisik</span>
              </div>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Total Volume: {jumlahBarang} {satuan}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Jumlah Barang <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  data-testid="input-jumlah-barang"
                  value={jumlahBarang}
                  onChange={(e) => handleJumlahBarangChange(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Satuan Barang <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="select-satuan-barang"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {SATUAN_INVENTARIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {satuan === 'Lainnya' && (
                  <div className="mt-2 animate-fadeIn">
                    <label className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                      Ketik Satuan Custom *
                    </label>
                    <input
                      type="text"
                      data-testid="input-satuan-custom"
                      required
                      value={customSatuan}
                      onChange={(e) => setCustomSatuan(e.target.value)}
                      placeholder="Contoh: Lusin, Roll, Rim, Meter, Box..."
                      className="w-full text-xs font-bold px-3 py-2 bg-blue-50/50 border border-blue-400 rounded-xl text-blue-950 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Condition Breakdown */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Rincian Fisik Saat Ini</span>
                <span className={`text-[11px] font-semibold ${isConditionBalanced ? 'text-emerald-700' : 'text-red-600 font-bold'}`}>
                  Terhitung: {totalKondisiFisik} dari {jumlahBarang} {satuan === 'Lainnya' ? (customSatuan || 'Satuan Custom') : satuan}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    ✓ Baik
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={jumlahBarang}
                    data-testid="input-kondisi-baik"
                    value={kondisiBaik}
                    onChange={(e) => handleKondisiBaikChange(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-bold px-2 py-1.5 bg-emerald-50/50 border border-emerald-300 rounded-lg text-emerald-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    ⚠ Rusak Ringan
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={jumlahBarang}
                    data-testid="input-kondisi-rusak-ringan"
                    value={kondisiRusakRingan}
                    onChange={(e) => handleRusakRinganChange(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-bold px-2 py-1.5 bg-amber-50/50 border border-amber-300 rounded-lg text-amber-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-red-200">
                  <label className="block text-[11px] font-bold text-red-800 mb-1">
                    ✕ Rusak Berat
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={jumlahBarang}
                    data-testid="input-kondisi-rusak-berat"
                    value={kondisiRusakBerat}
                    onChange={(e) => handleRusakBeratChange(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-bold px-2 py-1.5 bg-red-50/50 border border-red-300 rounded-lg text-red-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer min-h-[42px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isConditionBalanced}
              data-testid="btn-submit-inventaris"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[42px] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {isSubmitting 
                  ? 'Menyimpan Aset...' 
                  : (itemToEdit ? 'Simpan Perubahan Aset' : 'Simpan Aset ke Dapur')}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
