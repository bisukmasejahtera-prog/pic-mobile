import React from 'react';
import { ShieldCheck, Clock, Building2, Calendar } from 'lucide-react';
import { Dapur } from '../../types';
import { formatDateIndo, getDateStatusLabel } from '../../utils/dateUtils';

interface HeaderAppBarProps {
  currentDapur: Dapur;
  picName?: string;
  selectedDate?: string;
}

export const HeaderAppBar: React.FC<HeaderAppBarProps> = ({
  currentDapur,
  picName = 'Budi Santoso, S.P',
  selectedDate
}) => {
  const dateStatus = selectedDate ? getDateStatusLabel(selectedDate) : null;
  const formattedDate = selectedDate ? formatDateIndo(selectedDate, { withDayName: false }) : '';
  return (
    <header className="sticky top-0 z-30 bg-[#111827] text-white px-4 py-3 sm:py-3.5 border-b border-gray-800 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: PIC Profile & Kitchen Assignment */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0">
              PIC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">
                  PIC Logistik
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Aktif
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                {picName}
              </h1>
            </div>
          </div>

          {/* Assigned Kitchen Badge (Mobile) */}
          <div className="sm:hidden flex items-center gap-1.5 bg-gray-800/90 text-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-700 max-w-[180px]">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{currentDapur.nama.replace('Dapur ', '')}</span>
          </div>
        </div>

        {/* Right: Assigned Kitchen (Desktop) & Badges */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          
          {/* Assigned Kitchen Pill (Desktop >= sm) */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 text-xs font-semibold text-gray-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{currentDapur.nama}</span>
            <span className="text-[10px] text-gray-400 font-mono">({currentDapur.kode_bgn})</span>
          </div>

          {/* Operational Date Badge */}
          {selectedDate && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
              dateStatus?.isHMinusOne
                ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                : dateStatus?.isPast
                ? 'bg-blue-950/70 border-blue-500/50 text-blue-300'
                : 'bg-gray-800 border-gray-700 text-gray-200'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{formattedDate}</span>
              {dateStatus?.isHMinusOne && (
                <span className="text-[9px] font-bold px-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  H-1
                </span>
              )}
            </div>
          )}

          {/* Badges: HACCP & Shift */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HACCP</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-[11px] font-medium">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>Shift Dini Hari</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
