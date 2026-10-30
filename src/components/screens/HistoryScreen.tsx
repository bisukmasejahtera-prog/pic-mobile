import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Scale, 
  FileSpreadsheet, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Camera,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { PenerimaanBahanItem } from '../../types';
import { getTodayDateStr, getYesterdayDateStr, formatDateIndo } from '../../utils/dateUtils';

interface HistoryScreenProps {
  penerimaanItems: PenerimaanBahanItem[];
  selectedDate?: string;
  onOpenItemDetail?: (item: PenerimaanBahanItem) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  penerimaanItems,
  selectedDate,
  onOpenItemDetail
}) => {
  const todayStr = getTodayDateStr();
  const yesterdayStr = getYesterdayDateStr();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cold' | 'retur'>('all');
  const [filterReturOnly, setFilterReturOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('all');

  const coldChainItems = penerimaanItems.filter(x => x.suhu_celsius !== undefined);
  const returItems = penerimaanItems.filter(x => x.ada_retur);

  const filteredItems = penerimaanItems.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = searchQuery === '' ||
      item.nama_bahan_baku.toLowerCase().includes(q) ||
      item.nama_supplier.toLowerCase().includes(q) ||
      (item.catatan && item.catatan.toLowerCase().includes(q));

    const matchRetur = !filterReturOnly || item.ada_retur;
    const matchDate = dateFilter === 'all' || item.tanggal === dateFilter;

    let matchQC = true;
    if (activeFilter === 'cold') {
      matchQC = item.suhu_celsius !== undefined;
    } else if (activeFilter === 'retur') {
      matchQC = item.ada_retur;
    }

    return matchSearch && matchRetur && matchDate && matchQC;
  });

  const handleExportExcel = () => {
    alert(`Mengekspor ${filteredItems.length} data laporan bahan baku ke file Excel (.xlsx)...`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setFilterReturOnly(false);
    setDateFilter('all');
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 lg:pb-8 max-w-4xl mx-auto">
      
      {/* Header & Export Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Arsip Digital Logistik
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">
              QC & Riwayat Terpadu
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#111827]">
            Riwayat & Mutu Bahan Baku
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitoring Mutu & Pengawasan Retur (QC) serta log lengkap timbangan bahan dapur
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[44px]"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Export Excel (.xlsx)</span>
        </button>
      </div>

      {/* 3 Metric Pills & QC Filter Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
        
        {/* Metric 1: Total Bahan */}
        <div 
          onClick={() => {
            setActiveFilter('all');
            setFilterReturOnly(false);
          }}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'all' && !filterReturOnly 
              ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-300 shadow-xs' 
              : 'bg-white border-[#E5E7EB] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500 font-semibold">Total Bahan</span>
            <Scale className="w-3.5 h-3.5 text-gray-700" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900">
            {penerimaanItems.length} <span className="text-xs font-normal text-gray-500">Laporan</span>
          </div>
          <span className="text-[10px] text-gray-600 font-bold block mt-0.5">
            Semua Kategori
          </span>
        </div>

        {/* Metric 2: Rantai Dingin */}
        <div 
          onClick={() => {
            setActiveFilter('cold');
            setFilterReturOnly(false);
          }}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'cold' 
              ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300 shadow-xs' 
              : 'bg-white border-[#E5E7EB] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500 font-semibold">Rantai Dingin</span>
            <Thermometer className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900">
            {coldChainItems.length} <span className="text-xs font-normal text-gray-500">Bahan</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            Standar &le; 4.0°C
          </span>
        </div>

        {/* Metric 3: Bahan Diretur */}
        <div 
          onClick={() => {
            setActiveFilter('retur');
            setFilterReturOnly(true);
          }}
          className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'retur' || filterReturOnly
              ? 'bg-red-50 border-red-400 ring-1 ring-red-300 shadow-xs' 
              : 'bg-white border-[#E5E7EB] hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500 font-semibold">Bahan Diretur</span>
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-red-700">
            {returItems.length} <span className="text-xs font-normal text-red-500">Bahan</span>
          </div>
          <span className="text-[10px] text-red-700 font-bold block mt-0.5">
            Wajib Penggantian
          </span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-history-search"
              name="search_query"
              type="text"
              placeholder="Cari nama bahan baku, suplier, atau catatan..."
              aria-label="Cari nama bahan baku, suplier, atau catatan"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <label htmlFor="filter-retur-only" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer select-none text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shrink-0 min-h-[44px]">
            <input
              id="filter-retur-only"
              name="filter_retur_only"
              type="checkbox"
              checked={filterReturOnly}
              onChange={(e) => {
                setFilterReturOnly(e.target.checked);
                if (e.target.checked) {
                  setActiveFilter('retur');
                } else if (activeFilter === 'retur') {
                  setActiveFilter('all');
                }
              }}
              className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
            />
            <span>Hanya yang Ada Retur</span>
          </label>
        </div>

        {/* Date Filter Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 mr-1">
            Filter Tanggal:
          </span>
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[36px] ${
              dateFilter === 'all'
                ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semua Tanggal ({penerimaanItems.length})
          </button>
          <button
            type="button"
            onClick={() => setDateFilter(todayStr)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[36px] ${
              dateFilter === todayStr
                ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setDateFilter(yesterdayStr)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[36px] ${
              dateFilter === yesterdayStr
                ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Kemarin (H-1 Menu)
          </button>

          {(searchQuery || activeFilter !== 'all' || filterReturOnly || dateFilter !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* List of Items */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-gray-100 overflow-hidden shadow-2xs">
        {filteredItems.length === 0 ? (
          <div className="p-10 sm:p-12 text-center text-gray-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-40 text-gray-400" />
            <h4 className="text-sm font-bold text-gray-700">
              {penerimaanItems.length === 0 
                ? 'Belum Ada Laporan Bahan Masuk' 
                : 'Tidak Ada Laporan yang Cocok'}
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {penerimaanItems.length === 0 
                ? 'Catatan bahan baku yang ditimbang oleh PIC dapur akan otomatis muncul di sini.' 
                : 'Coba sesuaikan kata kunci pencarian atau ubah filter tanggal dan filter mutu di atas.'}
            </p>
            {penerimaanItems.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 cursor-pointer min-h-[40px]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tampilkan Semua Data</span>
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChilled = item.suhu_celsius !== undefined;
            const isColdSafe = isChilled && (item.suhu_celsius || 0) <= 4.0;

            return (
              <div
                key={item.id}
                onClick={() => onOpenItemDetail && onOpenItemDetail(item)}
                className="p-3.5 sm:p-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.ada_retur 
                      ? 'bg-red-100 text-red-700' 
                      : isChilled
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {item.ada_retur ? (
                      <RotateCcw className="w-5 h-5 text-red-700" />
                    ) : isChilled ? (
                      <Thermometer className="w-5 h-5 text-sky-700" />
                    ) : (
                      <Scale className="w-5 h-5 text-emerald-700" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#111827]">
                        {item.nama_bahan_baku}
                      </span>
                      {item.ada_retur ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          RETUR: {item.jumlah_retur} {item.satuan}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                          DITERIMA
                        </span>
                      )}
                      {isChilled && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                          isColdSafe 
                            ? 'bg-sky-50 text-sky-800 border-sky-200' 
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}>
                          <Thermometer className="w-3 h-3" />
                          <span>{item.suhu_celsius}°C {isColdSafe ? '(Aman)' : '(Perhatian)'}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-[#6B7280]">
                        {item.tanggal} • {item.jam_sampai} WIB
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-gray-700 mt-1">
                      Supplier: <span className="font-bold text-gray-900">{item.nama_supplier}</span>
                    </div>

                    {item.ada_retur && (
                      <div className="text-[11px] text-red-800 mt-1.5 bg-red-50/90 border border-red-200 px-2.5 py-1 rounded-lg">
                        <strong className="font-bold">Alasan Retur:</strong> {item.alasan_retur} 
                        {item.jam_sampai_retur ? (
                          <span className="ml-1 text-emerald-800 font-bold block sm:inline">
                            (Pengganti tiba: {item.jam_sampai_retur} WIB)
                          </span>
                        ) : (
                          <span className="ml-1 text-red-700 font-bold block sm:inline">
                            (Menunggu pengiriman pengganti)
                          </span>
                        )}
                      </div>
                    )}

                    {item.catatan && (
                      <div className="text-[11px] text-[#6B7280] mt-1 truncate italic">
                        "{item.catatan}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <div className="text-sm sm:text-base font-bold text-[#111827]">
                      {item.jumlah_sampai} {item.satuan}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-gray-500 flex items-center sm:justify-end gap-1 mt-0.5">
                      <Camera className="w-3 h-3 text-gray-400" />
                      <span>{item.foto_urls?.length || 0} foto bukti</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default HistoryScreen;