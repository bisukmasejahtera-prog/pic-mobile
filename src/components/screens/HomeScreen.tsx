import React from 'react';
import { 
  Truck, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  Calendar, 
  RotateCcw,
  AlertCircle,
  Wrench,
  DollarSign
} from 'lucide-react';
import { Dapur, PenerimaanBahanItem, LaporanKendalaDapur, TabType } from '../../types';
import { formatDateIndo, getDateStatusLabel, getTodayDateStr } from '../../utils/dateUtils';

interface HomeScreenProps {
  currentDapur: Dapur;
  selectedDate?: string;
  penerimaanItems: PenerimaanBahanItem[];
  laporanItems?: LaporanKendalaDapur[];
  onNavigateTab: (tab: TabType) => void;
  onOpenItemDetail?: (item: PenerimaanBahanItem) => void;
}

const KATEGORI_LABELS: Record<string, string> = {
  bahan_luar_rab: 'Bahan Luar RAB',
  jadwal_waktu: 'Jadwal / Waktu',
  kerusakan_alat: 'Kerusakan Alat',
  fasilitas_kurang: 'Fasilitas Kurang',
  lainnya: 'Lainnya'
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentDapur,
  selectedDate,
  penerimaanItems,
  laporanItems = [],
  onNavigateTab,
  onOpenItemDetail
}) => {
  const activeDate = selectedDate || getTodayDateStr();
  const dateStatus = getDateStatusLabel(activeDate);
  const formattedDate = formatDateIndo(activeDate);

  // Compute today's KPIs from received items
  const totalItems = penerimaanItems.length;
  const totalWeightKg = penerimaanItems.reduce((acc, i) => acc + (i.jumlah_sampai || 0), 0);
  const totalReturKg = penerimaanItems.reduce((acc, i) => acc + (i.ada_retur ? (i.jumlah_retur || 0) : 0), 0);
  const itemsWithReturCount = penerimaanItems.filter(i => i.ada_retur).length;
  const acceptancePercent = totalItems > 0 
    ? Number((((totalItems - itemsWithReturCount) / totalItems) * 100).toFixed(1))
    : 100;

  // Kendala KPIs
  const totalKendala = laporanItems.length;
  const pendingKendala = laporanItems.filter(k => k.status === 'pending');
  const diprosesKendala = laporanItems.filter(k => k.status === 'diproses');
  const selesaiKendala = laporanItems.filter(k => k.status === 'selesai');
  const emergencyKendala = laporanItems.filter(
    k => k.tingkat_urgensi === 'darurat' && k.status !== 'selesai' && k.status !== 'ditolak'
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-8">
      
      {/* Active Emergency Alert Banner */}
      {emergencyKendala.length > 0 && (
        <div 
          data-testid="emergency-banner-home"
          className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 sm:p-5 text-red-950 shadow-sm flex items-start gap-3.5 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-red-600 text-white">
                PERINGATAN DARURAT
              </span>
              <span className="text-xs font-black text-red-900">
                {emergencyKendala.length} Masalah Butuh Penanganan Langsung
              </span>
            </div>
            <p className="text-xs font-bold text-red-900 truncate">
              {emergencyKendala[0].judul}
            </p>
            <p className="text-[11px] text-red-700 mt-0.5 line-clamp-1">
              Kategori: {KATEGORI_LABELS[emergencyKendala[0].kategori] || emergencyKendala[0].kategori} | Pelapor: {emergencyKendala[0].pic_nama}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('laporan_dapur')}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-all cursor-pointer min-h-[40px] shadow-xs"
          >
            Buka Kendala
          </button>
        </div>
      )}

      {/* Hero Banner: Quick Action & Greeting */}
      <div className="bg-[#111827] text-white rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-white font-medium">{formattedDate}</span>
            {dateStatus.isHMinusOne && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Mode H-1 Menu
              </span>
            )}
            {dateStatus.isPast && !dateStatus.isHMinusOne && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                Mode Input Susulan
              </span>
            )}
            <span>•</span>
            <span className="text-emerald-400 font-bold">Shift Pagi Siaga</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1.5">
            Penerimaan Bahan Baku Dapur SPPG
          </h2>
          <p className="text-xs text-gray-300 max-w-xl mb-4">
            Catat penerimaan timbangan bahan baku suplier dan laporkan segera setiap ketidaksesuaian RAB, keterlambatan, atau kerusakan alat di {currentDapur.nama}.
          </p>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              data-testid="hero-btn-input-bahan"
              onClick={() => onNavigateTab('penerimaan')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#111827] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-[#111827]" />
              <span>+ Input 1 Bahan Baku Baru</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
            </button>

            <button
              type="button"
              data-testid="hero-btn-lapor-kendala"
              onClick={() => onNavigateTab('laporan_dapur')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>+ Lapor Kendala Dapur</span>
            </button>

            <button
              type="button"
              data-testid="hero-btn-inventaris"
              onClick={() => onNavigateTab('inventaris')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>Ceklis Inventaris Dapur</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Top KPI Metrics Grid (Logistik Bahan Baku) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* KPI 1: Total Bahan Masuk */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
            <span className="font-semibold">Bahan Diterima</span>
            <Scale className="w-4 h-4 text-[#111827]" />
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight">
            {totalItems} <span className="text-xs font-normal text-gray-500">Komoditas</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Diinput 1 per 1 oleh PIC
          </div>
        </div>

        {/* KPI 2: Total Bobot Masuk */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
            <span className="font-semibold">Total Bobot Netto</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight">
            {totalWeightKg.toFixed(1)} <span className="text-xs font-normal text-gray-500">Kg</span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1 truncate">
            Timbangan fisik riil dapur
          </div>
        </div>

        {/* KPI 3: Mutu / Bebas Retur */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
            <span className="font-semibold">Kelayakan Mutu</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight">
            {acceptancePercent}%
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Bahan lolos uji fisik
          </div>
        </div>

        {/* KPI 4: Total Retur */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
            <span className="font-semibold">Bahan Diretur</span>
            <RotateCcw className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-red-700 tracking-tight">
            {totalReturKg.toFixed(1)} <span className="text-xs font-normal text-gray-500">Kg</span>
          </div>
          <div className="text-[11px] text-red-700 font-bold mt-1">
            {itemsWithReturCount} kejadian retur hari ini
          </div>
        </div>

      </div>

      {/* Feed 1: Daftar Bahan Baku yang Diterima */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Logistik Masuk Hari Ini
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#111827]">
              Daftar Bahan Baku yang Diterima
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('riwayat')}
            className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <span>Semua Riwayat</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* List of Material Items or Empty State */}
        {penerimaanItems.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              Belum Ada Laporan Bahan Baku Masuk
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Bahan baku yang tiba dari suplier dan ditimbang oleh petugas PIC akan tercatat di sini secara real-time.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('penerimaan')}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold hover:bg-gray-800 transition-all cursor-pointer min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Bahan Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {penerimaanItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenItemDetail && onOpenItemDetail(item)}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.ada_retur ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Scale className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#111827] truncate">
                        {item.nama_bahan_baku}
                      </span>
                      {item.ada_retur ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          RETUR: {item.jumlah_retur} {item.satuan}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                          DITERIMA
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      Supplier: <strong className="text-gray-900">{item.nama_supplier}</strong>
                      {item.ada_retur && item.jam_sampai_retur && (
                        <span className="text-red-700 font-semibold ml-1">
                          • Ganti tiba: {item.jam_sampai_retur} WIB
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black text-[#111827]">
                    {item.jumlah_sampai} {item.satuan}
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {item.jam_sampai} WIB
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feed 2: Laporan Kendala & Ketidaksesuaian Dapur */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                Pusat Kendala Operasional
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-50 text-red-700 border border-red-200">
                {totalKendala} Laporan Terdata
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#111827] mt-0.5">
              Laporan Kendala Dapur
            </h3>
            <p className="text-xs text-gray-500">
              Ketidaksesuaian RAB, keterlambatan jadwal, kerusakan alat, atau fasilitas kurang
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="btn-tambah-kendala-home"
              onClick={() => onNavigateTab('laporan_dapur')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer min-h-[38px] shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Lapor Kendala</span>
            </button>
          </div>
        </div>

        {/* Kendala Status Breakdown Mini-Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4 p-2.5 bg-gray-50 rounded-xl text-center text-xs">
          <div className="p-1">
            <span className="text-[10px] text-gray-500 font-bold block">TOTAL</span>
            <span className="text-sm font-black text-gray-900">{totalKendala}</span>
          </div>
          <div className="p-1 border-l border-gray-200">
            <span className="text-[10px] text-amber-700 font-bold block">MENUNGGU</span>
            <span className="text-sm font-black text-amber-800">{pendingKendala.length}</span>
          </div>
          <div className="p-1 border-l border-gray-200">
            <span className="text-[10px] text-sky-700 font-bold block">DIPROSES</span>
            <span className="text-sm font-black text-sky-800">{diprosesKendala.length}</span>
          </div>
          <div className="p-1 border-l border-gray-200">
            <span className="text-[10px] text-emerald-700 font-bold block">TERATASI</span>
            <span className="text-sm font-black text-emerald-800">{selesaiKendala.length}</span>
          </div>
        </div>

        {/* List of Kendala Items or Empty State */}
        {laporanItems.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              Tidak Ada Kendala Operasional Aktif
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Operasional dapur berjalan optimal tanpa laporan ketidaksesuaian tertunda. Laporkan bila ada kendala mendesak.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('laporan_dapur')}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all cursor-pointer min-h-[44px]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Lapor Kendala Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {laporanItems.slice(0, 5).map((kendala) => {
              const isEmergency = kendala.tingkat_urgensi === 'darurat';
              const isMedium = kendala.tingkat_urgensi === 'sedang';
              const isPending = kendala.status === 'pending';
              const isDiproses = kendala.status === 'diproses';
              const isSelesai = kendala.status === 'selesai';

              return (
                <div
                  key={kendala.id}
                  onClick={() => onNavigateTab('laporan_dapur')}
                  className="py-3 sm:py-3.5 hover:bg-gray-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {/* Urgency Badge */}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                          isEmergency 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : isMedium 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {kendala.tingkat_urgensi.toUpperCase()}
                        </span>

                        {/* Category Badge */}
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                          {KATEGORI_LABELS[kendala.kategori] || kendala.kategori}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                          isPending 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isDiproses
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : isSelesai
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isPending ? 'MENUNGGU' : isDiproses ? 'DIPROSES' : isSelesai ? 'SELESAI' : 'DITOLAK'}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                        {kendala.judul}
                      </h4>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                        {kendala.deskripsi}
                      </p>

                      {/* Maker feedback indicator if exists */}
                      {kendala.tanggapan_maker && (
                        <div className="mt-1.5 p-2 bg-emerald-50/80 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                          <strong className="text-emerald-950 font-bold">Solusi / Tanggapan ERP:</strong> {kendala.tanggapan_maker}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1.5 flex-wrap">
                        <span>Oleh: <strong className="text-gray-600">{kendala.pic_nama}</strong></span>
                        {kendala.estimasi_biaya && kendala.estimasi_biaya > 0 ? (
                          <span className="text-gray-700 font-bold">
                            Biaya: Rp {kendala.estimasi_biaya.toLocaleString('id-ID')}
                          </span>
                        ) : null}
                        <span>{kendala.created_at.replace('T', ' ').substring(0, 16)} WIB</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 mt-1">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}

            {laporanItems.length > 5 && (
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => onNavigateTab('laporan_dapur')}
                  className="text-xs font-bold text-gray-700 hover:text-black inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Seluruh {laporanItems.length} Laporan Kendala</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operational Protocol Card */}
      <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-[#111827]">
            Alur Pelaporan Terpadu PIC Dapur SPPG
          </h4>
          <p className="text-[#6B7280] mt-0.5 leading-relaxed">
            1. Penerimaan Bahan: Setiap komoditas ditimbang fisik, dicatat jam tiba, suplier, dan foto timbangan masuk ke folder Google Drive arsip.
            2. Kendala Operasional: Setiap ketidaksesuaian RAB, keterlambatan armada, kerusakan alat dapur, atau kekurangan sarana wajib dilaporkan melalui menu Laporan Dapur agar Maker & Tim Pusat dapat merespons dengan cepat.
          </p>
        </div>
      </div>

    </div>
  );
};
