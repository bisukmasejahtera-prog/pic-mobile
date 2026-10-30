import React from 'react';
import { 
  Beef, 
  Fish, 
  Egg, 
  Wheat, 
  Carrot, 
  Apple, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Minus, 
  Plus,
  RotateCcw
} from 'lucide-react';
import { PenerimaanItem, StorageCondition, QCStatus } from '../../types';

interface CommodityWeightCardProps {
  item: PenerimaanItem;
  onChangeWeight: (itemId: string, newWeight: number) => void;
  onChangeTemp?: (itemId: string, newTemp: number) => void;
  onOpenRetur?: (item: PenerimaanItem) => void;
}

export const CommodityWeightCard: React.FC<CommodityWeightCardProps> = ({
  item,
  onChangeWeight,
  onChangeTemp,
  onOpenRetur
}) => {
  // Category Icon
  const getCategoryIcon = (kategori: string) => {
    const k = kategori.toLowerCase();
    if (k.includes('ayam') || k.includes('daging') || k.includes('hewani')) return Beef;
    if (k.includes('ikan')) return Fish;
    if (k.includes('telur')) return Egg;
    if (k.includes('beras') || k.includes('karbo')) return Wheat;
    if (k.includes('sayur') || k.includes('wortel')) return Carrot;
    return Apple;
  };

  const Icon = getCategoryIcon(item.nama_bahan);

  // Status Badge Styling based on Section 2 & 5.1
  const getStatusBadge = (status: QCStatus) => {
    switch (status) {
      case 'cocok':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#047857] border border-[#047857]/20">
            <CheckCircle2 className="w-3 h-3 text-[#047857]" />
            Cocok
          </span>
        );
      case 'susut_wajar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F9FF] text-[#0369A1] border border-[#0369A1]/20">
            Susut Wajar
          </span>
        );
      case 'perhatian':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Deviasi Tinggi
          </span>
        );
      case 'karantina':
      case 'tolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C]/20">
            <AlertTriangle className="w-3 h-3 text-[#B91C1C]" />
            Karantina / Tolak
          </span>
        );
    }
  };

  const hasTargetPo = item.has_target_po !== false;
  const deltaKg = hasTargetPo ? Number((item.timbangan_riil_kg - item.target_po_kg).toFixed(1)) : 0;
  const deltaPersen = hasTargetPo && item.target_po_kg > 0 
    ? Number(((deltaKg / item.target_po_kg) * 100).toFixed(1))
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 transition-all hover:border-gray-300">
      
      {/* Header: Icon, Item Name, PO Target & QC Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] text-[#374151] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[#374151]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-semibold text-[#111827] leading-tight">
                {item.nama_bahan}
              </h3>
              {item.is_custom_item && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Item Manual
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7280]">
              {hasTargetPo ? (
                <span>PO Target: <strong className="text-[#374151] font-semibold">{item.target_po_kg} {item.satuan}</strong></span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-sky-50 text-[#0369A1] font-bold text-[10px]">
                  Manual / Tanpa Target PO
                </span>
              )}
              <span>•</span>
              <span className="capitalize px-1.5 py-0.2 rounded-md bg-[#F3F4F6] text-[10px] font-bold text-[#374151]">
                {item.storage === 'chiller' ? 'Chiller 0-4°C' : item.storage === 'dry' ? 'Dry Room' : item.storage}
              </span>
            </div>
          </div>
        </div>

        <div>
          {getStatusBadge(item.status_qc)}
        </div>
      </div>

      {/* 2-Column Metric Huge Display (Section 5.1) */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-[#F3F4F6]">
        
        {/* Column 1: Timbangan Riil Netto (Editable Direct or via Stepper) */}
        <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
          <label htmlFor={`input-timbangan-${item.id}`} className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
            Timbangan Riil ({item.satuan})
          </label>
          <div className="flex items-baseline justify-between gap-1">
            <input
              id={`input-timbangan-${item.id}`}
              name={`timbangan_riil_${item.id}`}
              type="number"
              step="0.1"
              min="0"
              value={item.timbangan_riil_kg === 0 ? '' : item.timbangan_riil_kg}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeWeight(item.id, isNaN(val) ? 0 : val);
              }}
              placeholder="0.0"
              aria-label={`Timbangan Riil ${item.nama_bahan}`}
              className="w-24 sm:w-28 text-[28px] leading-[34px] font-bold text-[#111827] tracking-tight bg-transparent border-b border-dashed border-gray-300 focus:border-[#111827] focus:outline-none"
            />
            <span className="text-xs font-semibold text-[#6B7280]">{item.satuan}</span>
          </div>

          {/* Stepper Controls for Field Ergonomics */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-200/60">
            <button
              type="button"
              onClick={() => onChangeWeight(item.id, Math.max(0, Number((item.timbangan_riil_kg - 0.5).toFixed(1))))}
              className="flex-1 py-1 px-2 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold flex items-center justify-center min-h-[36px]"
              title="Kurang 0.5 kg"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            {hasTargetPo && (
              <button
                type="button"
                onClick={() => onChangeWeight(item.id, item.target_po_kg)}
                className="py-1 px-2.5 rounded-lg bg-white border border-[#E5E7EB] text-[11px] font-bold text-[#374151] hover:bg-gray-50 active:scale-95 transition-all min-h-[36px]"
                title="Reset ke target PO"
              >
                Pas
              </button>
            )}
            <button
              type="button"
              onClick={() => onChangeWeight(item.id, Number((item.timbangan_riil_kg + 0.5).toFixed(1)))}
              className="flex-1 py-1 px-2 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold flex items-center justify-center min-h-[36px]"
              title="Tambah 0.5 kg"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Suhu Termokopel / Suhu Peti */}
        <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-sky-600" />
                Suhu Peti / Core
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-[28px] leading-[34px] font-bold tracking-tight ${
                item.suhu_celsius !== undefined && item.suhu_celsius > 4.0 && item.storage === 'chiller'
                  ? 'text-amber-700'
                  : 'text-[#111827]'
              }`}>
                {item.suhu_celsius !== undefined ? item.suhu_celsius.toFixed(1) : '-'}
              </span>
              <span className="text-xs font-semibold text-[#6B7280]">°C</span>
            </div>
          </div>

          {/* Quick Temperature Toggle / Status */}
          <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
            {item.storage === 'chiller' || item.storage === 'freezer' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Standar &le; 4.0°C
              </span>
            ) : (
              <span className="text-[11px] text-[#6B7280] font-medium">Suhu Ruang Kamar</span>
            )}

            {onChangeTemp && (
              <button
                type="button"
                onClick={() => {
                  const current = item.suhu_celsius || 3.0;
                  onChangeTemp(item.id, current === 3.2 ? 5.5 : 3.2);
                }}
                className="text-[10px] text-sky-700 font-bold hover:underline cursor-pointer"
              >
                Ubah
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Footer: Rantai Dingin & Delta Susut (Section 5.1) */}
      <div className="mt-3 pt-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
            item.rantai_dingin_terjaga
              ? 'bg-[#ECFDF5] text-[#047857]'
              : 'bg-amber-50 text-amber-700'
          }`}>
            <Thermometer className="w-3 h-3" />
            {item.rantai_dingin_terjaga ? 'Rantai Dingin Terjaga' : 'Suhu Melebihi Batas'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasTargetPo ? (
            <span className={`text-xs font-bold ${
              deltaKg === 0 
                ? 'text-gray-500' 
                : deltaKg < 0 
                  ? 'text-sky-700' 
                  : 'text-emerald-700'
            }`}>
              Δ {deltaKg > 0 ? `+${deltaKg}` : deltaKg} {item.satuan} ({deltaPersen}%)
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-700">
              Riil: {item.timbangan_riil_kg} {item.satuan} (Sesuai)
            </span>
          )}

          {onOpenRetur && (
            <button
              type="button"
              onClick={() => onOpenRetur(item)}
              className="text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors cursor-pointer min-h-[32px]"
            >
              Retur Bahan
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
