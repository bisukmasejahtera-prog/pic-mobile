import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  Clock,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { PenerimaanBahanItem } from '../../types';

interface QualityScreenProps {
  penerimaanItems: PenerimaanBahanItem[];
  onOpenItemDetail?: (item: PenerimaanBahanItem) => void;
}

export const QualityScreen: React.FC<QualityScreenProps> = ({
  penerimaanItems,
  onOpenItemDetail
}) => {
  const coldChainItems = penerimaanItems.filter(x => x.suhu_celsius !== undefined);
  const returItems = penerimaanItems.filter(x => x.ada_retur);

  const [activeFilter, setActiveFilter] = useState<'all' | 'cold' | 'retur'>('all');

  const filtered = penerimaanItems.filter(item => {
    if (activeFilter === 'cold') return item.suhu_celsius !== undefined;
    if (activeFilter === 'retur') return item.ada_retur;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 lg:pb-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111827]">
              Monitoring Mutu & Pengawasan Retur (QC)
            </h2>
            <p className="text-xs text-[#6B7280]">
              Pengawasan suhu peti bahan hewani & rekapitulasi penggantian barang retur
            </p>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-gray-100 text-xs">
          <div 
            onClick={() => setActiveFilter('cold')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeFilter === 'cold' ? 'bg-sky-50 border-sky-300' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}
          >
            <span className="text-[11px] text-gray-500 block mb-0.5 font-semibold">Rantai Dingin</span>
            <div className="text-lg font-bold text-gray-900">{coldChainItems.length} Bahan</div>
            <span className="text-[10px] text-emerald-700 font-bold">Standar &le; 4.0°C</span>
          </div>

          <div 
            onClick={() => setActiveFilter('retur')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeFilter === 'retur' ? 'bg-red-50 border-red-300' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}
          >
            <span className="text-[11px] text-gray-500 block mb-0.5 font-semibold">Bahan Diretur</span>
            <div className="text-lg font-bold text-red-700">{returItems.length} Bahan</div>
            <span className="text-[10px] text-red-700 font-bold">Wajib Penggantian</span>
          </div>

          <div 
            onClick={() => setActiveFilter('all')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeFilter === 'all' ? 'bg-emerald-50 border-emerald-300' : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}
          >
            <span className="text-[11px] text-gray-500 block mb-0.5 font-semibold">Total Bahan</span>
            <div className="text-lg font-bold text-gray-900">{penerimaanItems.length} Laporan</div>
            <span className="text-[10px] text-gray-600 font-bold">Semua Kategori</span>
          </div>
        </div>
      </div>

      {/* List of Filtered Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-gray-900">
            {activeFilter === 'retur' && 'Daftar Bahan dengan Catatan Retur'}
            {activeFilter === 'cold' && 'Daftar Bahan dengan Catatan Suhu Rantai Dingin'}
            {activeFilter === 'all' && 'Semua Bahan Baku yang Diaudit Hari Ini'}
            {' '}({filtered.length} Komoditas)
          </h3>
        </div>

        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItemDetail && onOpenItemDetail(item)}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-gray-300 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900">{item.nama_bahan_baku}</h4>
                    {item.ada_retur ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        RETUR: {item.jumlah_retur} {item.satuan}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        MUTU BAIK
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Supplier: <strong className="text-gray-900">{item.nama_supplier}</strong> • Jam Sampai: {item.jam_sampai} WIB
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-gray-900">
                    {item.jumlah_sampai} {item.satuan}
                  </div>
                  {item.suhu_celsius && (
                    <span className="text-xs font-bold text-sky-700 flex items-center justify-end gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      {item.suhu_celsius}°C
                    </span>
                  )}
                </div>
              </div>

              {/* Retur details if present */}
              {item.ada_retur && (
                <div className="mt-3 pt-2.5 border-t border-gray-100 bg-red-50/60 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-red-900">
                    Alasan Kerusakan: {item.alasan_retur}
                  </div>
                  <div className="text-red-700 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Jam Sampai Retur / Pengganti: <strong>{item.jam_sampai_retur ? `${item.jam_sampai_retur} WIB` : 'Menunggu kedatangan armada'}</strong>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
