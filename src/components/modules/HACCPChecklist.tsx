import React from 'react';
import { Truck, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { HACCPChecklistState } from '../../types';

interface HACCPChecklistProps {
  checks: HACCPChecklistState;
  onChange: (checks: HACCPChecklistState) => void;
}

export const HACCPChecklist: React.FC<HACCPChecklistProps> = ({
  checks,
  onChange
}) => {
  const items = [
    {
      key: 'kebersihan_armada' as keyof HACCPChecklistState,
      title: 'Higiene & Sanitasi Armada Pengangkut',
      desc: 'Bak truk/boks bersih, bebas bau asing, tertutup rapat dari debu/hujan',
      icon: Truck
    },
    {
      key: 'uji_organoleptik' as keyof HACCPChecklistState,
      title: 'Uji Organoleptik & Kesegaran Fisik',
      desc: 'Aroma segar alami, tekstur kenyal elastis, bebas memar/lendir/kebusukan',
      icon: Sparkles
    },
    {
      key: 'kemasan_segel_utuh' as keyof HACCPChecklistState,
      title: 'Keutuhan Segel & Wadah Primer',
      desc: 'Kemasan bebas lubang/bocor, tertutup rapat, dan terhindar dari kontaminasi silang',
      icon: ShieldCheck
    }
  ];

  const completedCount = Object.values(checks).filter(Boolean).length;
  const isAllComplete = completedCount === items.length;

  const toggleCheck = (key: keyof HACCPChecklistState) => {
    onChange({
      ...checks,
      [key]: !checks[key]
    });
  };

  return (
    <div className={`bg-white rounded-2xl border p-4 transition-all ${
      isAllComplete ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-[#E5E7EB]'
    }`}>
      
      {/* Header with Title and Counter Badge */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Protokol Keamanan Pangan
          </span>
          <h3 className="text-sm font-bold text-[#111827]">
            Checkpoint HACCP & Verifikasi Fisik
          </h3>
        </div>

        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
          isAllComplete 
            ? 'bg-[#ECFDF5] text-[#047857] border border-[#047857]/20' 
            : 'bg-gray-100 text-[#374151]'
        }`}>
          {completedCount}/{items.length} Lengkap
        </span>
      </div>

      {/* Checklist items with 48px touch targets */}
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isChecked = checks[item.key];

          return (
            <label
              key={item.key}
              onClick={() => toggleCheck(item.key)}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer min-h-[48px] select-none ${
                isChecked
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] hover:bg-gray-100/70'
              }`}
            >
              {/* 22x22px custom checkbox */}
              <div className="pt-0.5">
                <div className={`w-[22px] h-[22px] rounded-lg border flex items-center justify-center transition-colors ${
                  isChecked
                    ? 'bg-[#047857] border-[#047857] text-white'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-700' : 'text-[#6B7280]'}`} />
                  <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-emerald-950' : 'text-[#111827]'}`}>
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </label>
          );
        })}
      </div>

    </div>
  );
};
