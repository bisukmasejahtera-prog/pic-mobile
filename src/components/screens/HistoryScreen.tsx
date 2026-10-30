import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Scale, 
  FileSpreadsheet, 
  Calendar, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  RotateCcw
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
  const [filterReturOnly, setFilterReturOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredItems = penerimaanItems.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchSearch = searchQuery === '' ||
      item.nama_bahan_baku.toLowerCase().includes(q) ||
      item.nama_supplier.toLowerCase().includes(q) ||
      (item.catatan && item.catatan.toLowerCase().includes(q));

    const matchRetur = !filterReturOnly || item.ada_retur;
    const matchDate = dateFilter === 'all' || item.tanggal === dateFilter;

    return matchSearch && matchRetur && matchDate;
  });

  const handleExportDummy = () => {
    alert(`Mengekspor ${filteredItems.length} data laporan bahan baku ke file Excel (.xlsx)...`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 lg:pb-8 max-w-4xl mx-auto">
      
      {/* Header & Export Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Arsip Digital Logistik
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[#111827]">
            Riwayat Penerimaan Bahan Baku
          </h2>
          <p className="text-xs text-[#6B7280]">
            Log lengkap per bahan baku yang ditimbang dan didokumentasikan di dapur
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportDummy}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[44px]"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Export Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 space-y-2.5">
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

          <label htmlFor="filter-retur-only" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer select-none text-xs font-bold text-gray-700">
            <input
              id="filter-retur-only"
              name="filter_retur_only"
              type="checkbox"
              checked={filterReturOnly}
              onChange={(e) => setFilterReturOnly(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-0"
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
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              dateFilter === yesterdayStr
                ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Kemarin (H-1 Menu)
          </button>
        </div>
      </div>

      {/* List of Items */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-gray-100 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <h4 className="text-sm font-bold text-gray-700">Tidak Ada Laporan yang Cocok</h4>
            <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItemDetail && onOpenItemDetail(item)}
              className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  item.ada_retur ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div className="min-w-0">
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
                    <span className="text-[11px] text-[#6B7280]">
                      {item.tanggal} • {item.jam_sampai} WIB
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-gray-700 mt-1">
                    Supplier: <span className="font-bold text-gray-900">{item.nama_supplier}</span>
                  </div>

                  {item.ada_retur && (
                    <div className="text-[11px] text-red-800 mt-1 bg-red-50 px-2.5 py-1 rounded-lg">
                      Alasan: {item.alasan_retur} {item.jam_sampai_retur ? `(Pengganti tiba: ${item.jam_sampai_retur} WIB)` : ''}
                    </div>
                  )}

                  {item.catatan && (
                    <div className="text-[11px] text-[#6B7280] mt-0.5 truncate italic">
                      "{item.catatan}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="text-left sm:text-right">
                  <div className="text-base font-bold text-[#111827]">
                    {item.jumlah_sampai} {item.satuan}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {item.foto_urls.length} foto bukti
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
