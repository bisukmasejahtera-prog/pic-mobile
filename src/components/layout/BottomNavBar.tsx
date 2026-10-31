import React from 'react';
import { LayoutDashboard, Truck, ClipboardCheck, Wrench, AlertTriangle, User } from 'lucide-react';
import { TabType } from '../../types';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingReceivingCount?: number;
  pendingLaporanCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  pendingReceivingCount = 0,
  pendingLaporanCount = 0
}) => {
  const tabs = [
    { id: 'beranda' as TabType, label: 'Beranda', icon: LayoutDashboard },
    { id: 'penerimaan' as TabType, label: 'Penerimaan', icon: Truck, badge: pendingReceivingCount },
    { id: 'riwayat' as TabType, label: 'Riwayat', icon: ClipboardCheck },
    { id: 'inventaris' as TabType, label: 'Inventaris', icon: Wrench },
    { id: 'laporan_dapur' as TabType, label: 'Laporan', icon: AlertTriangle, badge: pendingLaporanCount },
    { id: 'akun' as TabType, label: 'Akun', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] h-16 bottom-nav-shadow lg:hidden">
      <div className="max-w-md mx-auto h-full grid grid-cols-6 px-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'riwayat' && activeTab === 'cek_mutu');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 h-full min-h-[48px] min-w-[48px] cursor-pointer transition-colors relative ${
                isActive ? 'text-[#111827] font-bold' : 'text-[#6B7280] font-medium hover:text-[#374151]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#111827]' : 'text-[#6B7280]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] leading-none truncate max-w-[60px] text-center ${isActive ? 'text-[#111827] font-bold' : 'text-[#6B7280]'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#111827] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
