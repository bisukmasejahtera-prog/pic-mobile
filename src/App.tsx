import React, { useState, useEffect } from 'react';
import { TabType, Dapur, PenerimaanBahanItem } from './types';
import { MOCK_DAPURS, MOCK_VENDORS, MOCK_KOMODITAS, INITIAL_PENERIMAAN_BAHAN } from './data/mockData';
import { HeaderAppBar } from './components/layout/HeaderAppBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { HomeScreen } from './components/screens/HomeScreen';
import { ReceivingScreen } from './components/screens/ReceivingScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { BahanDetailModal } from './components/modules/BahanDetailModal';
import { CheckCircle2 } from 'lucide-react';
import { getTodayDateStr, getDateStatusLabel } from './utils/dateUtils';
import { saveDocument, deleteDocument, getCollectionDocs } from './lib/firebase';

const STORAGE_KEY_ITEMS = 'pic_mobile_bahan_items_v1';
const STORAGE_KEY_DAPUR = 'pic_mobile_dapur_v1';
const STORAGE_KEY_AUTH = 'pic_mobile_auth_v1';
const STORAGE_KEY_DATE = 'pic_mobile_selected_date_v1';
const STORAGE_KEY_ALL_DAPURS = 'pic_mobile_all_dapurs_v1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('beranda');
  
  // All Dapurs state loaded from cache or MOCK_DAPURS, enriched live from Firestore
  const [allDapurs, setAllDapurs] = useState<Dapur[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALL_DAPURS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return MOCK_DAPURS;
  });

  // Kitchen state with persistence (Assigned to 1 kitchen)
  const [currentDapur, setCurrentDapur] = useState<Dapur>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAPUR);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Trust saved dapur directly if valid object
        if (parsed && parsed.id && parsed.nama) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default fallback to Dapur Dummy if found, else first kitchen
    return MOCK_DAPURS.find(d => d.id === 'd-1790646298017') || MOCK_DAPURS[0];
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

  // Sync live data from Firestore collection 'penerimaan_bahan' on mount
  useEffect(() => {
    let isMounted = true;
    getCollectionDocs('penerimaan_bahan')
      .then((docs) => {
        if (!isMounted) return;
        if (Array.isArray(docs)) {
          // Check if localStorage has unsynced items
          let localItems: PenerimaanBahanItem[] = [];
          try {
            const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
            if (saved) localItems = JSON.parse(saved);
          } catch {
            // ignore
          }

          const firestoreMap = new Map((docs as PenerimaanBahanItem[]).map(d => [d.id, d]));

          // If local items exist that are not yet in Firestore, sync them to Firestore!
          for (const item of localItems) {
            if (!firestoreMap.has(item.id)) {
              saveDocument('penerimaan_bahan', item.id, item).catch(() => {});
              firestoreMap.set(item.id, item);
            }
          }

          const combined = Array.from(firestoreMap.values()).sort((a, b) => {
            const timeA = new Date(a.created_at || a.tanggal).getTime();
            const timeB = new Date(b.created_at || b.tanggal).getTime();
            return timeB - timeA;
          });

          setPenerimaanItems(combined);
        }
      })
      .catch((err) => {
        console.warn('Sync Firestore on load fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch and enrich dapurs list from Firestore collection 'dapurs' on mount
  useEffect(() => {
    let isMounted = true;
    getCollectionDocs('dapurs')
      .then((docs) => {
        if (!isMounted) return;
        if (Array.isArray(docs) && docs.length > 0) {
          const mapped: Dapur[] = docs.map((d: any) => ({
            id: d.id,
            nama: d.nama || d.name || 'Dapur SPPG',
            kode_bgn: d.kode_bgn || d.kode || `SPPG-${String(d.id || '').slice(-3).toUpperCase()}`,
            alamat: d.alamat || d.address || 'Alamat Unit Dapur',
            is_ud_yayasan_hub: d.is_ud_yayasan_hub ?? (d.tipe === 'yayasan_hub' || d.id === 'd-1'),
            vendor_default_id: d.vendor_default_id || 'vnd-ud-bisukma'
          }));

          const map = new Map<string, Dapur>();
          MOCK_DAPURS.forEach(d => map.set(d.id, d));
          mapped.forEach(d => map.set(d.id, d));
          const merged = Array.from(map.values());
          setAllDapurs(merged);
          try {
            localStorage.setItem(STORAGE_KEY_ALL_DAPURS, JSON.stringify(merged));
          } catch {
            // ignore
          }

          // If current kitchen matches remote data, keep it synchronized
          setCurrentDapur(prev => {
            const match = merged.find(d => d.id === prev.id);
            return match || prev;
          });
        }
      })
      .catch((err) => {
        console.warn('Sync dapurs from Firestore fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleLoginSuccess = (userData: { 
    name: string; 
    email: string;
    assigned_dapurs?: string[];
    assigned_dapur_names?: string[];
    dapur_id?: string;
  }) => {
    const userProfile = { name: userData.name, email: userData.email };
    setCurrentUser(userProfile);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(userProfile));
    } catch {
      // ignore
    }

    // Resolve assigned kitchen from user profile
    const targetDapurId = userData.dapur_id || (userData.assigned_dapurs && userData.assigned_dapurs[0]);
    if (targetDapurId) {
      const match = allDapurs.find(d => d.id === targetDapurId) || MOCK_DAPURS.find(d => d.id === targetDapurId);
      if (match) {
        setCurrentDapur(match);
      } else if (userData.assigned_dapur_names && userData.assigned_dapur_names[0]) {
        const customDapur: Dapur = {
          id: targetDapurId,
          nama: userData.assigned_dapur_names[0],
          kode_bgn: targetDapurId.startsWith('d-') ? `SPPG-${targetDapurId.slice(-4).toUpperCase()}` : 'SPPG-DAPUR',
          alamat: 'Alamat Unit Dapur SPPG',
          is_ud_yayasan_hub: false,
          vendor_default_id: 'vnd-ud-bisukma'
        };
        setCurrentDapur(customDapur);
      }
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

  const handleSaveBahanItem = async (newItem: PenerimaanBahanItem) => {
    setPenerimaanItems(prev => [newItem, ...prev]);
    showToast(`Laporan ${newItem.nama_bahan_baku} (${newItem.jumlah_sampai} ${newItem.satuan}) berhasil disimpan!`);
    
    // Sync to Firestore collection 'penerimaan_bahan'
    try {
      await saveDocument('penerimaan_bahan', newItem.id, newItem);
    } catch (err) {
      console.warn('Sync Firestore offline fallback:', err);
    }
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
        currentDapur={currentDapur}
        allDapurs={allDapurs}
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

          {(activeTab === 'riwayat' || activeTab === 'cek_mutu') && (
            <HistoryScreen
              penerimaanItems={penerimaanItems}
              selectedDate={selectedDate}
              onOpenItemDetail={setSelectedItemForDetail}
            />
          )}

          {activeTab === 'akun' && (
            <ProfileScreen
              currentDapur={currentDapur}
              allDapurs={allDapurs}
              onSelectDapur={(d) => {
                setCurrentDapur(d);
                showToast(`Unit dapur aktif diubah ke ${d.nama}`);
              }}
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
