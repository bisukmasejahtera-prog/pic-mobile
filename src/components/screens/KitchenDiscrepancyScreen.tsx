import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Filter, 
  Search, 
  Camera, 
  Upload, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  FileText, 
  ChevronRight, 
  MessageSquare, 
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { Dapur, LaporanKendalaDapur, KategoriKendala, TingkatUrgensi, StatusKendala } from '../../types';
import { formatDateIndo } from '../../utils/dateUtils';
import { 
  uploadPhotoToGoogleDrive, 
  GDRIVE_KENDALA_FOLDER_ID, 
  GDRIVE_KENDALA_FOLDER_URL,
  getDriveDirectImageUrl,
  compressImageFile
} from '../../utils/googleDrive';

interface KitchenDiscrepancyScreenProps {
  currentDapur: Dapur;
  picName?: string;
  laporanItems: LaporanKendalaDapur[];
  onSaveLaporan: (laporan: LaporanKendalaDapur) => Promise<void> | void;
  onOpenDetail?: (laporan: LaporanKendalaDapur) => void;
  prefillAlatNama?: string | null;
  onClearPrefillAlat?: () => void;
}

const KATEGORI_CONFIG: Record<KategoriKendala, { label: string; badgeClass: string; bgClass: string; borderClass: string; textClass: string }> = {
  bahan_luar_rab: {
    label: 'Bahan Baku di Luar RAB',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-800'
  },
  jadwal_waktu: {
    label: 'Keterlambatan / Waktu',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-800'
  },
  kerusakan_alat: {
    label: 'Kerusakan Alat Dapur',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-800'
  },
  fasilitas_kurang: {
    label: 'Kekurangan Fasilitas',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-800'
  },
  lainnya: {
    label: 'Kendala Lainnya',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-700'
  }
};

const URGENSI_CONFIG: Record<TingkatUrgensi, { label: string; badgeClass: string; dotClass: string }> = {
  darurat: {
    label: 'Darurat',
    badgeClass: 'bg-red-600 text-white border-red-700 font-black',
    dotClass: 'bg-red-500 animate-ping'
  },
  sedang: {
    label: 'Sedang',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    dotClass: 'bg-amber-500'
  },
  rendah: {
    label: 'Rendah',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 font-medium',
    dotClass: 'bg-blue-400'
  }
};

const STATUS_CONFIG: Record<StatusKendala, { label: string; badgeClass: string }> = {
  pending: {
    label: 'Menunggu Review',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300'
  },
  diproses: {
    label: 'Sedang Ditangani',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300'
  },
  selesai: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  ditolak: {
    label: 'Ditolak',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300'
  }
};

const STORAGE_KEY_DISCREPANCY_DRAFT = 'pic_mobile_kendala_draft_v1';

export const KitchenDiscrepancyScreen: React.FC<KitchenDiscrepancyScreenProps> = ({
  currentDapur,
  picName = 'Petugas PIC',
  laporanItems,
  onSaveLaporan,
  onOpenDetail,
  prefillAlatNama,
  onClearPrefillAlat
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLaporanForDetail, setSelectedLaporanForDetail] = useState<LaporanKendalaDapur | null>(null);

  // Filters
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterUrgensi, setFilterUrgensi] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states
  const [formKategori, setFormKategori] = useState<KategoriKendala>('bahan_luar_rab');
  const [formUrgensi, setFormUrgensi] = useState<TingkatUrgensi>('sedang');
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTindakan, setFormTindakan] = useState('');
  const [formBiaya, setFormBiaya] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = cameraInputRef;

  // Restore draft if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISCREPANCY_DRAFT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.showCreateModal) setShowCreateModal(true);
        if (parsed.formKategori) setFormKategori(parsed.formKategori);
        if (parsed.formUrgensi) setFormUrgensi(parsed.formUrgensi);
        if (parsed.formJudul !== undefined) setFormJudul(parsed.formJudul);
        if (parsed.formDeskripsi !== undefined) setFormDeskripsi(parsed.formDeskripsi);
        if (parsed.formTindakan !== undefined) setFormTindakan(parsed.formTindakan);
        if (parsed.formBiaya !== undefined) setFormBiaya(parsed.formBiaya);
        if (Array.isArray(parsed.formPhotos)) setFormPhotos(parsed.formPhotos);
      }
    } catch {
      // ignore
    }
    setDraftLoaded(true);
  }, []);

  // Save draft whenever modal content changes
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      if (showCreateModal) {
        const draft = {
          showCreateModal: true,
          formKategori,
          formUrgensi,
          formJudul,
          formDeskripsi,
          formTindakan,
          formBiaya,
          formPhotos
        };
        localStorage.setItem(STORAGE_KEY_DISCREPANCY_DRAFT, JSON.stringify(draft));
      } else {
        localStorage.removeItem(STORAGE_KEY_DISCREPANCY_DRAFT);
      }
    } catch {
      // ignore
    }
  }, [
    draftLoaded,
    showCreateModal,
    formKategori,
    formUrgensi,
    formJudul,
    formDeskripsi,
    formTindakan,
    formBiaya,
    formPhotos
  ]);

  // Auto open form when redirected from Inventaris with a broken equipment
  useEffect(() => {
    if (prefillAlatNama) {
      setFormKategori('kerusakan_alat');
      setFormUrgensi('sedang');
      setFormJudul(`Kerusakan Alat: ${prefillAlatNama}`);
      setFormDeskripsi(`Peralatan ${prefillAlatNama} mengalami kendala saat inspeksi rutin mingguan.`);
      setShowCreateModal(true);
      if (onClearPrefillAlat) onClearPrefillAlat();
    }
  }, [prefillAlatNama, onClearPrefillAlat]);

  // Filtered reports
  const filteredItems = laporanItems.filter(item => {
    if (filterKategori !== 'semua' && item.kategori !== filterKategori) return false;
    if (filterStatus !== 'semua' && item.status !== filterStatus) return false;
    if (filterUrgensi !== 'semua' && item.tingkat_urgensi !== filterUrgensi) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchDeskripsi = item.deskripsi.toLowerCase().includes(q);
      const matchPic = (item.pic_nama || '').toLowerCase().includes(q);
      if (!matchJudul && !matchDeskripsi && !matchPic) return false;
    }
    return true;
  });

  // Emergency count (unresolved darurat reports)
  const activeEmergencyCount = laporanItems.filter(
    i => i.tingkat_urgensi === 'darurat' && (i.status === 'pending' || i.status === 'diproses')
  ).length;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }

    const timeStr = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const fileName = `KENDALA_${currentDapur.kode_bgn}_${formKategori}_${timeStr}.jpg`;

    setIsUploadingPhoto(true);
    try {
      const res = await uploadPhotoToGoogleDrive(
        file,
        fileName,
        GDRIVE_KENDALA_FOLDER_ID,
        `Bukti Kendala Dapur ${currentDapur.nama}: ${formJudul || formKategori}`
      );
      const finalUrl = res.thumbnailUrl || res.webViewLink || res.downloadUrl;
      if (finalUrl) {
        setFormPhotos(prev => [...prev, finalUrl]);
      }
    } catch {
      // Local preview fallback with canvas compression to protect memory
      try {
        const { base64 } = await compressImageFile(file);
        setFormPhotos(prev => [...prev, base64]);
      } catch {
        // ignore
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormJudul('');
    setFormDeskripsi('');
    setFormTindakan('');
    setFormBiaya('');
    setFormPhotos([]);
    try {
      localStorage.removeItem(STORAGE_KEY_DISCREPANCY_DRAFT);
    } catch {
      // ignore
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJudul.trim()) {
      alert('Mohon isi judul atau ringkasan kendala.');
      return;
    }
    if (!formDeskripsi.trim()) {
      alert('Mohon isi uraian kronologi masalah yang dihadapi.');
      return;
    }

    setIsSubmitting(true);
    const newLaporan: LaporanKendalaDapur = {
      id: `KND-${Date.now()}`,
      dapur_id: currentDapur.id,
      dapur_nama: currentDapur.nama,
      pic_nama: picName,
      kategori: formKategori,
      tingkat_urgensi: formUrgensi,
      judul: formJudul.trim(),
      deskripsi: formDeskripsi.trim(),
      tindakan_sementara: formTindakan.trim() || undefined,
      estimasi_biaya: formBiaya ? Number(formBiaya) : undefined,
      foto_urls: formPhotos,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      await onSaveLaporan(newLaporan);
      // Reset form and clear draft
      setFormJudul('');
      setFormDeskripsi('');
      setFormTindakan('');
      setFormBiaya('');
      setFormPhotos([]);
      setShowCreateModal(false);
      try {
        localStorage.removeItem(STORAGE_KEY_DISCREPANCY_DRAFT);
      } catch {
        // ignore
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      
      {/* Top Banner Notice: Active Emergency */}
      {activeEmergencyCount > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-600 text-white shadow-md flex items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider uppercase text-red-100">
                Pemberitahuan Darurat Aktif
              </div>
              <p className="text-xs sm:text-sm font-bold leading-snug">
                Terdapat {activeEmergencyCount} laporan kendala berstatus DARURAT yang sedang ditangani.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFilterUrgensi('darurat');
              setFilterStatus('semua');
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-red-700 text-xs font-bold hover:bg-red-50 cursor-pointer shrink-0 transition-colors"
          >
            Lihat Laporan
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3 h-3 text-amber-700" />
              <span>{currentDapur.nama}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#111827] tracking-tight">
              Laporan Kendala & Ketidaksesuaian Dapur
            </h1>
            <p className="text-xs text-[#6B7280]">
              Laporkan kekurangan bahan di luar RAB, keterlambatan, kerusakan alat, atau sarana fasilitas ke Tim Maker Yayasan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-3 bg-[#111827] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[48px]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Buat Laporan Baru</span>
          </button>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
            <div className="text-[10px] font-bold uppercase text-gray-500">Total Laporan</div>
            <div className="text-xl font-black text-gray-900 mt-0.5">{laporanItems.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <div className="text-[10px] font-bold uppercase text-yellow-800">Menunggu Review</div>
            <div className="text-xl font-black text-yellow-900 mt-0.5">
              {laporanItems.filter(i => i.status === 'pending').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
            <div className="text-[10px] font-bold uppercase text-sky-800">Sedang Ditangani</div>
            <div className="text-xl font-black text-sky-900 mt-0.5">
              {laporanItems.filter(i => i.status === 'diproses').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] font-bold uppercase text-emerald-800">Selesai Teratasi</div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">
              {laporanItems.filter(i => i.status === 'selesai').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul masalah atau kronologi..."
              className="w-full pl-9 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500 min-h-[44px]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-gray-500 cursor-pointer min-h-[44px]"
          >
            <option value="semua">Semua Kategori</option>
            <option value="bahan_luar_rab">Bahan Baku (Luar RAB)</option>
            <option value="jadwal_waktu">Keterlambatan Waktu</option>
            <option value="kerusakan_alat">Kerusakan Alat Dapur</option>
            <option value="fasilitas_kurang">Kekurangan Fasilitas</option>
            <option value="lainnya">Lainnya</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-gray-500 cursor-pointer min-h-[44px]"
          >
            <option value="semua">Semua Status</option>
            <option value="pending">Menunggu Review</option>
            <option value="diproses">Sedang Ditangani</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>

          {/* Urgensi Filter */}
          <select
            value={filterUrgensi}
            onChange={(e) => setFilterUrgensi(e.target.value)}
            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-gray-500 cursor-pointer min-h-[44px]"
          >
            <option value="semua">Semua Urgensi</option>
            <option value="darurat">Darurat</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Belum Ada Laporan Kendala</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Tidak ada laporan ketidaksesuaian yang sesuai dengan kriteria filter saat ini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-xs font-bold rounded-xl hover:bg-black cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan Baru</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const kat = KATEGORI_CONFIG[item.kategori] || KATEGORI_CONFIG.lainnya;
            const urg = URGENSI_CONFIG[item.tingkat_urgensi] || URGENSI_CONFIG.sedang;
            const stat = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const formattedDate = formatDateIndo(item.created_at.slice(0, 10));
            const timePart = item.created_at.includes('T') ? item.created_at.split('T')[1].slice(0, 5) : '';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedLaporanForDetail(item)}
                className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-gray-300 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-3 relative"
              >
                {/* Header row: Kategori & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${kat.badgeClass}`}>
                      {kat.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${urg.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${urg.dotClass}`} />
                      <span>{urg.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stat.badgeClass}`}>
                      {stat.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Title & Preview */}
                <div>
                  <h3 className="text-sm font-bold text-[#111827] leading-snug">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>

                {/* Maker Response Preview (if present) */}
                {item.tanggapan_maker && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tanggapan Maker / Admin:</span>
                    </div>
                    <p className="text-emerald-950 font-medium italic line-clamp-2">
                      "{item.tanggapan_maker}"
                    </p>
                  </div>
                )}

                {/* Footer Info: Reporter, Date, Photo count */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">{item.pic_nama}</span>
                    <span>•</span>
                    <span>{formattedDate} {timePart && `(${timePart} WIB)`}</span>
                  </div>

                  {item.foto_urls && item.foto_urls.length > 0 && (
                    <div className="flex items-center gap-1 font-semibold text-gray-600">
                      <Camera className="w-3.5 h-3.5 text-gray-500" />
                      <span>{item.foto_urls.length} Foto</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900">
                    Laporan Kendala Dapur
                  </h2>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Unit: {currentDapur.nama}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="w-8 h-8 rounded-xl hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitForm} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Kategori Kendala */}
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">
                  KATEGORI KENDALA <span className="text-red-600">*</span>
                </label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value as KategoriKendala)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500 cursor-pointer min-h-[44px]"
                >
                  <option value="bahan_luar_rab">Bahan Baku (di Luar RAB / Darurat Kurang)</option>
                  <option value="jadwal_waktu">Keterlambatan Waktu / Disrupsi Jadwal</option>
                  <option value="kerusakan_alat">Kerusakan Alat & Perlengkapan Dapur</option>
                  <option value="fasilitas_kurang">Fasilitas / Sarana Kurang & Perlu Tambahan</option>
                  <option value="lainnya">Kendala Operasional Lainnya</option>
                </select>
              </div>

              {/* Tingkat Urgensi */}
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">
                  TINGKAT URGENSI <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['rendah', 'sedang', 'darurat'] as TingkatUrgensi[]).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setFormUrgensi(urg)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        formUrgensi === urg
                          ? urg === 'darurat'
                            ? 'bg-red-600 text-white border-red-700 shadow-xs'
                            : urg === 'sedang'
                            ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                            : 'bg-blue-100 text-blue-900 border-blue-400 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="capitalize">{urg}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Judul Kendala */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  RINGKASAN / JUDUL KENDALA <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="cth: Chiller daging mati sejak jam 05:00 / Kurang ayam 20 kg"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Deskripsi Kronologi */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  KRONOLOGI & DETAIL MASALAH <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Jelaskan detail apa yang terjadi, penyebab (jika diketahui), dan dampaknya ke jam masak..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Tindakan Sementara (Opsional) */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  TINDAKAN SEMENTARA YANG SUDAH DIAMBIL (OPSIONAL)
                </label>
                <input
                  type="text"
                  value={formTindakan}
                  onChange={(e) => setFormTindakan(e.target.value)}
                  placeholder="cth: Daging dipindahkan ke chiller sayur sementara"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500"
                />
              </div>

              {/* Estimasi Biaya (Khusus jika terkait pengadaan darurat) */}
              {formKategori === 'bahan_luar_rab' && (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    PERKIRAAN BIAYA TAMBAHAN (RP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                    <input
                      type="number"
                      min={0}
                      value={formBiaya}
                      onChange={(e) => setFormBiaya(e.target.value)}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Foto Bukti Fisik */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">
                  FOTO BUKTI FISIK KONDISI DAPUR / ALAT
                </label>

                <div className="flex flex-wrap gap-2">
                  {formPhotos.map((pUrl, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <img src={getDriveDirectImageUrl(pUrl)} alt="Bukti" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}

                  {/* Native Camera input */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    aria-label="Ambil Foto Kamera"
                  />

                  {/* Photo Gallery input */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    aria-label="Pilih Foto dari Galeri"
                  />

                  {/* Tombol Kamera */}
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/80 hover:bg-sky-100 flex flex-col items-center justify-center gap-1 text-sky-700 cursor-pointer transition-colors"
                    title="Ambil foto langsung dengan kamera"
                  >
                    <Camera className="w-4 h-4 text-sky-600" />
                    <span className="text-[9px] font-bold">
                      {isUploadingPhoto ? '...' : 'Kamera'}
                    </span>
                  </button>

                  {/* Tombol Galeri */}
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 flex flex-col items-center justify-center gap-1 text-emerald-700 cursor-pointer transition-colors"
                    title="Pilih foto dari galeri HP"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-[9px] font-bold">
                      {isUploadingPhoto ? '...' : 'Galeri'}
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    Tersimpan di Google Drive Kendala Dapur
                  </span>
                  <a
                    href={GDRIVE_KENDALA_FOLDER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                  >
                    <span>Folder Drive</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="flex-1 py-3 px-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors cursor-pointer min-h-[48px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  className="flex-1 py-3 px-3 rounded-xl bg-[#111827] hover:bg-black text-white font-bold transition-all shadow-md cursor-pointer disabled:bg-gray-400 min-h-[48px]"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLaporanForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${KATEGORI_CONFIG[selectedLaporanForDetail.kategori]?.badgeClass}`}>
                  {KATEGORI_CONFIG[selectedLaporanForDetail.kategori]?.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${URGENSI_CONFIG[selectedLaporanForDetail.tingkat_urgensi]?.badgeClass}`}>
                  {URGENSI_CONFIG[selectedLaporanForDetail.tingkat_urgensi]?.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLaporanForDetail(null)}
                className="w-8 h-8 rounded-xl hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs text-gray-700">
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">
                  {selectedLaporanForDetail.judul}
                </h2>
                <div className="flex items-center gap-2 text-gray-500 text-[11px] mt-1">
                  <span>Unit: {selectedLaporanForDetail.dapur_nama}</span>
                  <span>•</span>
                  <span>Pelapor: {selectedLaporanForDetail.pic_nama}</span>
                  <span>•</span>
                  <span>{formatDateIndo(selectedLaporanForDetail.created_at.slice(0, 10))}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <span className="font-semibold text-gray-600">Status Tindak Lanjut:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_CONFIG[selectedLaporanForDetail.status]?.badgeClass}`}>
                  {STATUS_CONFIG[selectedLaporanForDetail.status]?.label}
                </span>
              </div>

              {/* Kronologi */}
              <div className="space-y-1">
                <div className="font-bold text-gray-900">Kronologi & Uraian:</div>
                <p className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedLaporanForDetail.deskripsi}
                </p>
              </div>

              {/* Tindakan Sementara */}
              {selectedLaporanForDetail.tindakan_sementara && (
                <div className="space-y-1">
                  <div className="font-bold text-gray-900">Tindakan Sementara Tim Dapur:</div>
                  <p className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 leading-relaxed">
                    {selectedLaporanForDetail.tindakan_sementara}
                  </p>
                </div>
              )}

              {/* Tanggapan Maker Yayasan */}
              <div className="space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Respon / Arahan Tim Maker Yayasan:</span>
                </div>
                {selectedLaporanForDetail.tanggapan_maker ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium leading-relaxed space-y-1.5">
                    <p className="italic">
                      "{selectedLaporanForDetail.tanggapan_maker}"
                    </p>
                    {selectedLaporanForDetail.ditindaklanjuti_oleh && (
                      <div className="text-[10px] text-emerald-800 font-bold border-t border-emerald-200/60 pt-1">
                        Oleh: {selectedLaporanForDetail.ditindaklanjuti_oleh}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 font-medium text-[11px]">
                    Laporan ini belum mendapat balasan atau catatan dari Maker Operasional.
                  </div>
                )}
              </div>

              {/* Foto Bukti */}
              {selectedLaporanForDetail.foto_urls && selectedLaporanForDetail.foto_urls.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900">Foto Bukti Fisik ({selectedLaporanForDetail.foto_urls.length}):</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedLaporanForDetail.foto_urls.map((pUrl, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 h-32 relative">
                        <img src={getDriveDirectImageUrl(pUrl)} alt="Bukti" className="w-full h-full object-cover" />
                        <a
                          href={pUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-1 right-1 bg-black/70 hover:bg-black text-white text-[9px] px-2 py-0.5 rounded font-bold flex items-center gap-1"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLaporanForDetail(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
