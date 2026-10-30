import React from 'react';
import { LayoutDashboard, Truck, ClipboardCheck, History, User, Building2, ShieldCheck, LogOut, Calendar } from 'lucide-react';
import { TabType, Dapur } from '../../types';
import { formatDateIndo, getDateStatusLabel } from '../../utils/dateUtils';

interface DesktopSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentDapur: Dapur;
  picName?: string;
  selectedDate?: string;
  onLogout?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  currentDapur,
  picName = 'Budi Santoso, S.P',
  selectedDate,
  onLogout
}) => {
  const dateStatus = selectedDate ? getDateStatusLabel(selectedDate) : null;
  const menuItems = [
    { id: 'beranda' as TabType, label: 'Beranda Ops', icon: LayoutDashboard, desc: 'Ringkasan & status harian' },
    { id: 'penerimaan' as TabType, label: 'Penerimaan Bahan', icon: Truck, desc: 'Timbangan & Surat Jalan' },
    { id: 'riwayat' as TabType, label: 'Riwayat & Mutu', icon: ClipboardCheck, desc: 'Arsip nota, QC & retur' },
    { id: 'akun' as TabType, label: 'Akun & Sistem', icon: User, desc: 'Pengaturan & profil PIC' }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-[#E5E7EB] h-screen sticky top-0 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center font-black text-xs shadow-xs">
            PIC
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider uppercase text-[#111827]">
              Bisukma Field Ops
            </h2>
            <p className="text-[11px] text-[#6B7280] font-medium">
              Logistics & Receiving v1.0
            </p>
          </div>
        </div>

        {/* Dapur Penugasan (Static) */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280] mb-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Unit Dapur Penugasan
            </span>
            {currentDapur.is_ud_yayasan_hub && (
              <span className="text-[9px] px-1 py-0.2 rounded font-black bg-blue-100 text-blue-700">
                HUB 7
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-[#111827] truncate">
            {currentDapur.nama}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            {currentDapur.kode_bgn}
          </div>
        </div>

        {/* Tanggal Operasional */}
        {selectedDate && (
          <div className="mt-2.5 p-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280] mb-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Tanggal Logistik
              </span>
              {dateStatus?.isHMinusOne && (
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  H-1
                </span>
              )}
              {dateStatus?.isToday && (
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Hari Ini
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-[#111827]">
              {formatDateIndo(selectedDate)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] px-3 py-1">
          Menu Operasional
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'riwayat' && activeTab === 'cek_mutu');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111827] text-white font-bold shadow-xs'
                  : 'text-[#374151] hover:bg-[#F3F4F6] font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
              <div className="min-w-0">
                <div className="text-xs leading-none">{item.label}</div>
                <div className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Sign-out */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E5E7EB]">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-700">
            {picName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#111827] truncate">{picName}</div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified PIC Dapur
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-[10px] text-[#6B7280] text-center font-medium">
          Tersinkronisasi ISO 22000 & SIPGN
        </div>
      </div>

    </aside>
  );
};
