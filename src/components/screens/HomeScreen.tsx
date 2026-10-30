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
  Building2,
  Calendar,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Dapur, PenerimaanBahanItem, TabType } from '../../types';
import { formatDateIndo, getDateStatusLabel, getTodayDateStr } from '../../utils/dateUtils';

interface HomeScreenProps {
  currentDapur: Dapur;
  selectedDate?: string;
  penerimaanItems: PenerimaanBahanItem[];
  onNavigateTab: (tab: TabType) => void;
  onOpenItemDetail?: (item: PenerimaanBahanItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentDapur,
  selectedDate,
  penerimaanItems,
  onNavigateTab,
  onOpenItemDetail
}) => {
  const activeDate = selectedDate || getTodayDateStr();
  const dateStatus = getDateStatusLabel(activeDate);
  const formattedDate = formatDateIndo(activeDate);

  // Compute today's KPIs from 1-per-1 received items
  const totalItems = penerimaanItems.length;
  const totalWeightKg = penerimaanItems.reduce((acc, i) => acc + (i.jumlah_sampai || 0), 0);
  const totalReturKg = penerimaanItems.reduce((acc, i) => acc + (i.ada_retur ? (i.jumlah_retur || 0) : 0), 0);
  const itemsWithReturCount = penerimaanItems.filter(i => i.ada_retur).length;
  const acceptancePercent = totalItems > 0 
    ? Number((((totalItems - itemsWithReturCount) / totalItems) * 100).toFixed(1))
    : 100;

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-8">
      
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
          <p className="text-xs text-gray-300 max-w-lg mb-4">
            Catat hasil timbangan fisik, nama suplier, jam sampai, dan catatan retur per bahan baku yang tiba di {currentDapur.nama}.
          </p>

          <button
            type="button"
            onClick={() => onNavigateTab('penerimaan')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#111827] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-[#111827]" />
            <span>+ Input 1 Bahan Baku Baru</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        {/* Subtle Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Top KPI Metrics Grid */}
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

      {/* Feed Bahan Masuk Hari Ini */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5">
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

        {/* List of Items */}
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

      </div>

      {/* Operational Protocol Card */}
      <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-[#111827]">
            Alur Pelaporan Bahan Baku Masuk
          </h4>
          <p className="text-[#6B7280] mt-0.5 leading-relaxed">
            1. Setiap ada bahan tiba (pagi, subuh, atau sore), petugas menimbang dan mencatat: nama bahan, nama supplier, jumlah sampai, dan jam sampai.
            2. Jika terdapat bahan rusak/busuk, aktifkan opsi retur dan catat jam berapa suplier mengirimkan bahan pengganti.
            3. Foto timbangan atau nota langsung tersimpan di Google Drive folder BAHAN_BAKU.
          </p>
        </div>
      </div>

    </div>
  );
};
