import React, { useState, useEffect } from 'react';
import { TabType, Dapur, PenerimaanBahanItem } from './types';
import { MOCK_DAPURS, MOCK_VENDORS, MOCK_KOMODITAS, INITIAL_PENERIMAAN_BAHAN } from './data/mockData';
import { HeaderAppBar } from './components/layout/HeaderAppBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { HomeScreen } from './components/screens/HomeScreen';
import { ReceivingScreen } from './components/screens/ReceivingScreen';
import { QualityScreen } from './components/screens/QualityScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { BahanDetailModal } from './components/modules/BahanDetailModal';
import { CheckCircle2 } from 'lucide-react';
import { getTodayDateStr, getDateStatusLabel } from './utils/dateUtils';
import { saveDocument, deleteDocument } from './lib/firebase';

const STORAGE_KEY_ITEMS = 'pic_mobile_bahan_items_v1';
const STORAGE_KEY_DAPUR = 'pic_mobile_dapur_v1';
const STORAGE_KEY_AUTH = 'pic_mobile_auth_v1';
const STORAGE_KEY_DATE = 'pic_mobile_selected_date_v1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('beranda');
  
  // Kitchen state with persistence (Assigned to 1 kitchen)
  const [currentDapur, setCurrentDapur] = useState<Dapur>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAPUR);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = MOCK_DAPURS.find(d => d.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // ignore
    }
    return MOCK_DAPURS[0];
  });

  // Operational Date State with persistence
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATE);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return getTodayDateStr();
  });

  // Auth User State with persistence
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null; // Show Login Screen first so user can preview and test login
  });

  // 1-per-1 Raw Material Items State with persistence
  const [penerimaanItems, setPenerimaanItems] = useState<PenerimaanBahanItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_PENERIMAAN_BAHAN;
  });

  const [selectedItemForDetail, setSelectedItemForDetail] = useState<PenerimaanBahanItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAPUR, JSON.stringify(currentDapur));
    } catch {
      // ignore
    }
  }, [currentDapur]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATE, selectedDate);
    } catch {
      // ignore
    }
  }, [selectedDate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(penerimaanItems));
    } catch {
      // ignore
    }
  }, [penerimaanItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userData));
    } catch {
      // ignore
    }
    showToast(`Selamat datang, ${userData.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {
      // ignore
    }
    showToast('Anda telah keluar dari akun.');
  };

  const handleSaveBahanItem = (newItem: PenerimaanBahanItem) => {
    setPenerimaanItems(prev => [newItem, ...prev]);
    showToast(`Laporan ${newItem.nama_bahan_baku} (${newItem.jumlah_sampai} ${newItem.satuan}) berhasil disimpan!`);
    
    // Sync to Firestore collection 'penerimaan_bahan'
    saveDocument('penerimaan_bahan', newItem.id, newItem).catch(err => {
      console.warn('Sync Firestore offline fallback:', err);
    });
  };

  const handleDeleteBahanItem = (id: string) => {
    setPenerimaanItems(prev => prev.filter(i => i.id !== id));
    showToast('Item berhasil dihapus dari daftar.');

    // Delete from Firestore
    deleteDocument('penerimaan_bahan', id).catch(err => {
      console.warn('Delete Firestore offline fallback:', err);
    });
  };

  // If not logged in, render dedicated LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-[#111827] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500/30 animate-bounce">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-tight">
            {toastMessage}
          </p>
        </div>
      )}

      {/* Desktop Sidebar (>= 1024px) */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentDapur={currentDapur}
        picName={currentUser.name}
        selectedDate={selectedDate}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        
        {/* Mobile Header (< 1024px) */}
        <div className="lg:hidden">
          <HeaderAppBar
            currentDapur={currentDapur}
            picName={currentUser.name}
            selectedDate={selectedDate}
          />
        </div>

        {/* Content View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {activeTab === 'beranda' && (
            <HomeScreen
              currentDapur={currentDapur}
              selectedDate={selectedDate}
              penerimaanItems={penerimaanItems}
              onNavigateTab={setActiveTab}
              onOpenItemDetail={setSelectedItemForDetail}
            />
          )}

          {activeTab === 'penerimaan' && (
            <ReceivingScreen
              currentDapur={currentDapur}
              picName={currentUser.name}
              selectedDate={selectedDate}
              vendors={MOCK_VENDORS}
              availableKomoditas={MOCK_KOMODITAS}
              penerimaanItems={penerimaanItems}
              onSaveBahanItem={handleSaveBahanItem}
              onDeleteBahanItem={handleDeleteBahanItem}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'cek_mutu' && (
            <QualityScreen
              penerimaanItems={penerimaanItems}
              onOpenItemDetail={setSelectedItemForDetail}
            />
          )}

          {activeTab === 'riwayat' && (
            <HistoryScreen
              penerimaanItems={penerimaanItems}
              selectedDate={selectedDate}
              onOpenItemDetail={setSelectedItemForDetail}
            />
          )}

          {activeTab === 'akun' && (
            <ProfileScreen
              currentDapur={currentDapur}
              picName={currentUser.name}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation (< 1024px) */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingReceivingCount={penerimaanItems.filter(i => i.ada_retur && !i.jam_sampai_retur).length}
        />
      </div>

      {/* Modal Detail Bukti Penerimaan */}
      <BahanDetailModal
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
      />
    </div>
  );
};

export default App;
