import React, { useState, useEffect } from 'react';
import { TabType, Dapur, PenerimaanBahanItem, LaporanKendalaDapur } from './types';
import { MOCK_DAPURS, MOCK_VENDORS, MOCK_KOMODITAS, INITIAL_PENERIMAAN_BAHAN } from './data/mockData';
import { HeaderAppBar } from './components/layout/HeaderAppBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { HomeScreen } from './components/screens/HomeScreen';
import { ReceivingScreen } from './components/screens/ReceivingScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { KitchenDiscrepancyScreen } from './components/screens/KitchenDiscrepancyScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { BahanDetailModal } from './components/modules/BahanDetailModal';
import { CheckCircle2 } from 'lucide-react';
import { getTodayDateStr, getDateStatusLabel } from './utils/dateUtils';
import { db, saveDocument, deleteDocument, getCollectionDocs } from './lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const STORAGE_KEY_ITEMS = 'pic_mobile_bahan_items_v1';
const STORAGE_KEY_DAPUR = 'pic_mobile_dapur_v1';
const STORAGE_KEY_AUTH = 'pic_mobile_auth_v1';
const STORAGE_KEY_DATE = 'pic_mobile_selected_date_v1';
const STORAGE_KEY_ALL_DAPURS = 'pic_mobile_all_dapurs_v1';
const STORAGE_KEY_LAPORAN = 'pic_mobile_laporan_dapur_v1';

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

  // Laporan Kendala Dapur Items State with persistence
  const [laporanItems, setLaporanItems] = useState<LaporanKendalaDapur[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAPORAN);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
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
          // Filter out any legacy dummy mock items
          const realItems = (docs as PenerimaanBahanItem[]).filter(item => 
            item && 
            !item.id?.startsWith('dummy-') && 
            item.id !== 'RCV-ITM-01' && 
            item.id !== 'RCV-ITM-02'
          );

          realItems.sort((a, b) => {
            const timeA = new Date(a.created_at || a.tanggal).getTime();
            const timeB = new Date(b.created_at || b.tanggal).getTime();
            return timeB - timeA;
          });

          setPenerimaanItems(realItems);
          try {
            localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(realItems));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.warn('Sync Firestore on load fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync live data from Firestore collection 'laporan_kendala_dapur' on mount
  useEffect(() => {
    let isMounted = true;
    getCollectionDocs('laporan_kendala_dapur')
      .then((docs) => {
        if (!isMounted) return;
        if (Array.isArray(docs)) {
          const list = (docs as LaporanKendalaDapur[]).sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setLaporanItems(list);
          try {
            localStorage.setItem(STORAGE_KEY_LAPORAN, JSON.stringify(list));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.warn('Sync Firestore laporan_kendala_dapur fallback:', err);
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
            nama: d.nama_dapur || d.nama || d.name || 'Dapur SPPG',
            kode_bgn: d.kode_bgn || d.kode || d.bgn_id || `SPPG-${String(d.id || '').slice(-4).toUpperCase()}`,
            alamat: d.alamat || d.address || 'Unit Dapur Yayasan Bisukma',
            is_ud_yayasan_hub: d.is_ud_yayasan_hub ?? false,
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

  // Strictly bind currentDapur to currentUser's authoritative assigned kitchen in Firestore
  useEffect(() => {
    if (!currentUser?.email) return;

    let isMounted = true;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', currentUser.email.toLowerCase().trim()));

    getDocs(q).then((snap) => {
      if (!isMounted || snap.empty) return;
      const uDoc = snap.docs[0].data();
      const targetDapurId = uDoc.dapur_id || (uDoc.assigned_dapurs && uDoc.assigned_dapurs[0]);
      if (targetDapurId) {
        // Try matching in allDapurs first
        const match = allDapurs.find(d => d.id === targetDapurId);
        if (match) {
          setCurrentDapur(match);
        } else {
          // Fetch exact dapur document from Firestore
          const dRef = collection(db, 'dapurs');
          getDocs(query(dRef, where('id', '==', targetDapurId))).then(dSnap => {
            if (!isMounted || dSnap.empty) return;
            const dData = dSnap.docs[0].data();
            const resolvedDapur: Dapur = {
              id: dData.id,
              nama: dData.nama_dapur || dData.nama || 'Dapur SPPG',
              kode_bgn: dData.kode_bgn || dData.kode || dData.bgn_id || 'SPPG-DAPUR',
              alamat: dData.alamat || 'Unit Dapur Yayasan Bisukma',
              is_ud_yayasan_hub: false,
              vendor_default_id: 'vnd-ud-bisukma'
            };
            setCurrentDapur(resolvedDapur);
          }).catch(() => {});
        }
      }
    }).catch(err => {
      console.warn('Strict dapur auto-bind error:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser, allDapurs]);

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

  const handleSaveLaporan = async (newLaporan: LaporanKendalaDapur) => {
    setLaporanItems(prev => [newLaporan, ...prev]);
    showToast(`Laporan "${newLaporan.judul}" berhasil dikirim ke Maker!`);

    // Sync to Firestore collection 'laporan_kendala_dapur'
    try {
      await saveDocument('laporan_kendala_dapur', newLaporan.id, newLaporan);
    } catch (err) {
      console.warn('Sync Firestore laporan_kendala_dapur fallback:', err);
    }
  };

  // If not logged in, render dedicated LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        currentDapur={currentDapur}
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

          {activeTab === 'laporan_dapur' && (
            <KitchenDiscrepancyScreen
              currentDapur={currentDapur}
              picName={currentUser.name}
              laporanItems={laporanItems}
              onSaveLaporan={handleSaveLaporan}
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
          pendingLaporanCount={laporanItems.filter(i => i.status === 'pending').length}
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
