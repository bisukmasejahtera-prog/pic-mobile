import React from 'react';
import { ArrowRight, Bookmark, ShieldCheck, Check } from 'lucide-react';

interface StickyActionBarProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  totalItemsCount?: number;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  onSaveDraft,
  onSubmit,
  isSubmitting = false,
  totalItemsCount = 0
}) => {
  return (
    <div className="sticky bottom-16 lg:bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 sm:p-4 sticky-bar-shadow">
      <div className="max-w-2xl mx-auto space-y-2">
        
        {/* Buttons Row */}
        <div className="flex items-center gap-2.5">
          {/* Secondary Button: Simpan Draft */}
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[48px] active:scale-[0.98] cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-[#374151]" />
            <span>Simpan Draft</span>
          </button>

          {/* Primary Button: Konfirmasi Masuk / Selesai */}
          <button
            type="button"
            disabled={isSubmitting || totalItemsCount === 0}
            onClick={onSubmit}
            className={`flex-[1.5] py-3 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98] cursor-pointer shadow-xs ${
              isSubmitting || totalItemsCount === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-[#111827] hover:bg-black text-white'
            }`}
          >
            <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Masuk / Selesai'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Micro Compliance Tagline */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B7280]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tersinkronisasi ISO 22000 / HACCP & SIPGN Kemenkes/BGN</span>
        </div>

      </div>
    </div>
  );
};
