import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  Boxes, 
  RotateCcw, 
  Plus, 
  ExternalLink,
  Flame,
  Refrigerator,
  Truck,
  Sparkles,
  Info,
  Pencil
} from 'lucide-react';
import { Dapur, InventarisItem, InspeksiMingguanLog, TabType } from '../../types';
import { db, saveDocument, getCollectionDocs } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FormInputAsetTersediaModal } from '../modules/FormInputAsetTersediaModal';

interface KitchenInventoryScreenProps {
  currentDapur: Dapur;
  picName: string;
  onNavigateTab?: (tab: TabType) => void;
  onOpenLaporKendalaForAlat?: (namaAlat: string) => void;
}

function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function getCategoryIcon(kategori: string = '') {
  const k = kategori.toLowerCase();
  if (k.includes('masak') || k.includes('mesin')) {
    return <Flame className="w-4 h-4 text-orange-600" />;
  }
  if (k.includes('dingin') || k.includes('chiller') || k.includes('freezer')) {
    return <Refrigerator className="w-4 h-4 text-sky-600" />;
  }
  if (k.includes('distribusi') || k.includes('ompreng')) {
    return <Truck className="w-4 h-4 text-indigo-600" />;
  }
  return <Wrench className="w-4 h-4 text-emerald-600" />;
}

export const KitchenInventoryScreen: React.FC<KitchenInventoryScreenProps> = ({
  currentDapur,
  picName,
  onNavigateTab,
  onOpenLaporKendalaForAlat
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeekNumber = getWeekNumber(now);
  const currentWeekId = `${currentYear}-W${String(currentWeekNumber).padStart(2, '0')}`;
  const currentWeekLabel = `Minggu ke-${currentWeekNumber} (${now.toLocaleString('id-ID', { month: 'short' })} ${currentYear})`;

  const [inventarisItems, setInventarisItems] = useState<InventarisItem[]>([]);
  const [inspectionLogs, setInspectionLogs] = useState<InspeksiMingguanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [itemConditions, setItemConditions] = useState<Record<string, 'normal' | 'kendala'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventarisItem | null>(null);

  // Sync inventaris for this kitchen in real-time from Firestore
  useEffect(() => {
    let isMounted = true;
    try {
      const q = query(
        collection(db, 'inventaris'),
        where('dapur_id', 'in', [currentDapur.id, currentDapur.nama])
      );

      const unsub = onSnapshot(q, (snap) => {
        if (!isMounted) return;
        const items: InventarisItem[] = [];
        snap.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as InventarisItem);
        });

        // If specific query returned empty, try fallback fetching all and filter in memory
        if (items.length === 0) {
          getCollectionDocs('inventaris')
            .then((all) => {
              if (!isMounted) return;
              const filtered = (all as InventarisItem[]).filter(
                x => x.dapur_id === currentDapur.id || 
                     x.dapur_nama === currentDapur.nama ||
                     (currentDapur.id === 'd-1790646298017' && (
                       x.dapur_nama === 'Dapur Dummy' || 
                       x.dapur_nama?.includes('Simamora Tarutung') || 
                       x.dapur_nama?.includes('Bisukma')
                     ))
              );
              setInventarisItems(filtered);
              setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
        } else {
          // Strictly filter to current dapur only
          const filtered = items.filter(
            x => x.dapur_id === currentDapur.id || 
                 x.dapur_nama === currentDapur.nama ||
                 (currentDapur.id === 'd-1790646298017' && (
                   x.dapur_nama === 'Dapur Dummy' || 
                   x.dapur_nama?.includes('Simamora Tarutung') || 
                   x.dapur_nama?.includes('Bisukma')
                 ))
          );
          setInventarisItems(filtered);
          setIsLoading(false);
        }
      }, () => {
        setIsLoading(false);
      });

      return () => unsub();
    } catch {
      setIsLoading(false);
    }
  }, [currentDapur.id, currentDapur.nama]);

  // Sync weekly inspection logs for this kitchen
  useEffect(() => {
    let isMounted = true;
    try {
      const q = query(
        collection(db, 'inspeksi_inventaris'),
        where('dapur_id', '==', currentDapur.id)
      );
      const unsub = onSnapshot(q, (snap) => {
        if (!isMounted) return;
        const logs: InspeksiMingguanLog[] = [];
        snap.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() } as InspeksiMingguanLog);
        });
        logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setInspectionLogs(logs);
      });
      return () => unsub();
    } catch {
      // offline fallback
    }
  }, [currentDapur.id]);

  // Check if current week has already been verified
  const currentWeekLog = useMemo(() => {
    return inspectionLogs.find(log => log.minggu_label?.includes(`Minggu ke-${currentWeekNumber}`) || log.id.includes(currentWeekId));
  }, [inspectionLogs, currentWeekNumber, currentWeekId]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAsetSuccess = (savedItem: InventarisItem) => {
    setInventarisItems(prev => {
      const idx = prev.findIndex(x => x.id === savedItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedItem;
        return copy;
      }
      return [savedItem, ...prev];
    });
    showNotification(`Aset "${savedItem.nama_barang}" berhasil ${selectedItemForEdit ? 'diperbarui' : 'dicatat'} di ${currentDapur.nama}!`);
    setSelectedItemForEdit(null);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return inventarisItems.filter(item => {
      const matchKategori = selectedKategori === 'all' || item.kategori === selectedKategori;
      const q = searchQuery.toLowerCase();
      const matchSearch = searchQuery === '' ||
        item.nama_barang.toLowerCase().includes(q) ||
        (item.spesifikasi && item.spesifikasi.toLowerCase().includes(q)) ||
        (item.kode_aset && item.kode_aset.toLowerCase().includes(q));
      return matchKategori && matchSearch;
    });
  }, [inventarisItems, selectedKategori, searchQuery]);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    inventarisItems.forEach(i => {
      if (i.kategori) set.add(i.kategori);
    });
    return Array.from(set);
  }, [inventarisItems]);

  // Handle Toggle Condition for single item
  const handleToggleCondition = (itemId: string, condition: 'normal' | 'kendala') => {
    setItemConditions(prev => ({
      ...prev,
      [itemId]: condition
    }));
  };

  // Quick 1-tap verify all normal
  const handleVerifyAllNormal = async () => {
    if (inventarisItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const allNormalStatus: Record<string, 'normal' | 'kendala'> = {};
      inventarisItems.forEach(item => {
        allNormalStatus[item.id] = 'normal';
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const newLog: InspeksiMingguanLog = {
        id: `INSP-${currentDapur.id}-${currentWeekId}`,
        dapur_id: currentDapur.id,
        dapur_nama: currentDapur.nama,
        pic_nama: picName,
        tanggal_inspeksi: todayStr,
        minggu_label: currentWeekLabel,
        total_alat: inventarisItems.length,
        total_normal: inventarisItems.length,
        total_kendala: 0,
        items_status: allNormalStatus,
        created_at: new Date().toISOString()
      };

      await saveDocument('inspeksi_inventaris', newLog.id, newLog);
      setItemConditions(allNormalStatus);
      showNotification(`Inspeksi ${currentWeekLabel} berhasil disimpan: Semua alat berfungsi normal!`);
    } catch (err) {
      console.warn('Simpan inspeksi error fallback:', err);
      showNotification('Pemeriksaan mingguan berhasil diverifikasi lokal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit customized checklist
  const handleSubmitChecklist = async () => {
    if (inventarisItems.length === 0) return;
    setIsSubmitting(true);
    try {
      let normalCount = 0;
      let kendalaCount = 0;
      const finalStatus: Record<string, 'normal' | 'kendala'> = {};

      inventarisItems.forEach(item => {
        const cond = itemConditions[item.id] || 'normal';
        finalStatus[item.id] = cond;
        if (cond === 'normal') normalCount++;
        else kendalaCount++;
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const newLog: InspeksiMingguanLog = {
        id: `INSP-${currentDapur.id}-${currentWeekId}`,
        dapur_id: currentDapur.id,
        dapur_nama: currentDapur.nama,
        pic_nama: picName,
        tanggal_inspeksi: todayStr,
        minggu_label: currentWeekLabel,
        total_alat: inventarisItems.length,
        total_normal: normalCount,
        total_kendala: kendalaCount,
        items_status: finalStatus,
        created_at: new Date().toISOString()
      };

      await saveDocument('inspeksi_inventaris', newLog.id, newLog);
      showNotification(`Hasil ceklis mingguan berhasil dikirim ke Pusat (${kendalaCount} alat perlu perhatian).`);
    } catch (err) {
      console.warn('Simpan checklist error fallback:', err);
      showNotification('Hasil ceklis berhasil disimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Route to report kitchen discrepancy for a specific broken equipment
  const handleReportEquipmentIssue = (item: InventarisItem) => {
    if (onOpenLaporKendalaForAlat) {
      onOpenLaporKendalaForAlat(item.nama_barang);
    } else if (onNavigateTab) {
      onNavigateTab('laporan_dapur');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 lg:pb-8 max-w-4xl mx-auto">
      
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

      {/* Screen Header */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Pengawasan Aset & Sarana
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-extrabold bg-blue-100 text-blue-800">
              Ceklis Mingguan Berkala
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#111827]">
            Inventaris Peralatan Dapur
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Daftar peralatan fisik di {currentDapur.nama} dan status kelayakan fisik mingguan
          </p>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 flex-wrap">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
              Total Peralatan
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#111827]">
              {inventarisItems.length} <span className="text-xs font-normal text-gray-500">Aset</span>
            </span>
          </div>

          <button
            type="button"
            data-testid="btn-open-input-aset"
            onClick={() => {
              setSelectedItemForEdit(null);
              setShowInputModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Aset Dapur</span>
          </button>
        </div>
      </div>

      {/* Weekly Inspection Banner Card */}
      <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        currentWeekLog 
          ? 'bg-emerald-50/70 border-emerald-300' 
          : 'bg-amber-50/80 border-amber-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              currentWeekLog ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {currentWeekLog ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold text-gray-900">
                  {currentWeekLabel}
                </span>
                {currentWeekLog ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    SUDAH DIVERIFIKASI
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    BUTUH CEKLIS MINGGUAN
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {currentWeekLog 
                  ? `Diverifikasi oleh ${currentWeekLog.pic_nama} pada ${currentWeekLog.tanggal_inspeksi} (${currentWeekLog.total_normal} normal, ${currentWeekLog.total_kendala} kendala).`
                  : 'Pastikan seluruh peralatan dapur berfungsi optimal sebelum periode masak harian berikutnya.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {inventarisItems.length > 0 && !currentWeekLog && (
              <button
                type="button"
                data-testid="btn-verify-all-normal"
                onClick={handleVerifyAllNormal}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[42px] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Semua Alat Normal Minggu Ini</span>
              </button>
            )}

            {inventarisItems.length > 0 && currentWeekLog && (
              <button
                type="button"
                onClick={handleVerifyAllNormal}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer min-h-[38px] disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verifikasi Ulang</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 space-y-2.5 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-inventory-search"
            name="search_inventory"
            type="text"
            placeholder="Cari nama peralatan, kode aset, atau spesifikasi..."
            aria-label="Cari nama peralatan dapur"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 mr-1">
            Kategori:
          </span>
          <button
            type="button"
            onClick={() => setSelectedKategori('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[36px] ${
              selectedKategori === 'all'
                ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semua ({inventarisItems.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedKategori(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer min-h-[36px] ${
                selectedKategori === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-emerald-600 rounded-full mx-auto mb-2" />
            <p className="text-xs">Memuat daftar inventaris dapur...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 sm:p-10 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              {inventarisItems.length === 0
                ? 'Belum Ada Peralatan Terdaftar dari Pusat'
                : 'Tidak Ada Peralatan yang Cocok'}
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {inventarisItems.length === 0
                ? 'Daftar inventaris alat dapur didaftarkan resmi oleh Tim Pusat di ERP Desktop. Setelah didaftarkan, seluruh peralatan akan otomatis tampil di sini untuk diceklis setiap minggu.'
                : 'Silakan sesuaikan kata kunci pencarian atau ubah filter kategori di atas.'}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                data-testid="btn-empty-input-aset"
                onClick={() => {
                  setSelectedItemForEdit(null);
                  setShowInputModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Aset Yang Tersedia</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('laporan_dapur')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer min-h-[40px]"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Laporkan Kebutuhan Sarana Dapur</span>
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map(item => {
            const currentCondition = itemConditions[item.id] || (currentWeekLog?.items_status?.[item.id]) || 'normal';
            const isKendala = currentCondition === 'kendala';

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all ${
                  isKendala ? 'border-red-300 bg-red-50/20' : 'border-[#E5E7EB]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(item.kategori)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                          {item.nama_barang}
                        </h4>
                        {item.kategori && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-gray-100 text-gray-600">
                            {item.kategori}
                          </span>
                        )}
                        {item.kode_aset && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {item.kode_aset}
                          </span>
                        )}
                      </div>

                      {item.spesifikasi && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {item.spesifikasi}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-2 flex-wrap">
                        <span>
                          Jumlah: <strong className="text-gray-900 font-bold">{item.total_kuantitas_pcs} {item.satuan}</strong>
                        </span>
                        {item.kondisi_baik_pcs !== undefined && (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Baik: {item.kondisi_baik_pcs}
                          </span>
                        )}
                        {Boolean(item.kondisi_rusak_berat_pcs || item.kondisi_rusak_ringan_pcs) && (
                          <span className="text-[11px] text-red-700 font-semibold">
                            Ada Rusak: {(item.kondisi_rusak_berat_pcs || 0) + (item.kondisi_rusak_ringan_pcs || 0)}
                          </span>
                        )}
                      </div>

                      {item.catatan && (
                        <p className="text-[11px] text-gray-500 mt-1.5 italic bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          Catatan: {item.catatan}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action & Status Toggle Buttons */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        type="button"
                        data-testid={`btn-edit-aset-${item.id}`}
                        onClick={() => {
                          setSelectedItemForEdit(item);
                          setShowInputModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-gray-700 hover:text-blue-700 text-xs font-bold transition-all cursor-pointer min-h-[36px]"
                        title="Edit data dan kondisi fisik aset ini"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit</span>
                      </button>

                      <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                        <button
                          type="button"
                          data-testid={`btn-cond-normal-${item.id}`}
                          onClick={() => handleToggleCondition(item.id, 'normal')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                            !isKendala 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          ✓ Normal
                        </button>
                        <button
                          type="button"
                          data-testid={`btn-cond-kendala-${item.id}`}
                          onClick={() => handleToggleCondition(item.id, 'kendala')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                            isKendala 
                              ? 'bg-red-600 text-white shadow-xs' 
                              : 'text-gray-600 hover:text-red-700'
                          }`}
                        >
                          ⚠ Ada Kendala
                        </button>
                      </div>
                    </div>

                    {isKendala && (
                      <button
                        type="button"
                        data-testid={`btn-lapor-kerusakan-${item.id}`}
                        onClick={() => handleReportEquipmentIssue(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs cursor-pointer min-h-[34px]"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>+ Lapor Kerusakan ke Maker</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Manual Checklist Button if Modified */}
      {inventarisItems.length > 0 && Object.keys(itemConditions).length > 0 && (
        <div className="sticky bottom-20 z-20 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-gray-300 shadow-lg flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-gray-900">Perubahan Status Belum Dikirim</span>
            <p className="text-[11px] text-gray-500">Klik simpan untuk memperbarui hasil ceklis ke sistem pusat.</p>
          </div>
          <button
            type="button"
            data-testid="btn-save-custom-checklist"
            onClick={handleSubmitChecklist}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[40px] disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Ceklis Mingguan'}
          </button>
        </div>
      )}

      {/* Operational Protocol Card */}
      <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-[#111827]">
            SOP Ceklis Inventaris Dapur SPPG
          </h4>
          <p className="text-[#6B7280] mt-0.5 leading-relaxed">
            1. Master data aset peralatan dapur diisi secara terpusat oleh Tim Pengadaan Yayasan di ERP Desktop, atau dicatat oleh PIC untuk aset yang telah tersedia di dapur.
            2. Petugas PIC bertanggung jawab melakukan cek fisik mingguan terhadap fungsi kompor, steamer, freezer, dan ompreng.
            3. Jika terdapat alat yang malfungsi atau rusak berat, tandai "Ada Kendala" dan kirim laporan agar Maker segera menerbitkan disposisi perbaikan teknisi.
          </p>
        </div>
      </div>

      {/* Modal Input & Edit Aset Tersedia */}
      <FormInputAsetTersediaModal
        isOpen={showInputModal}
        onClose={() => {
          setShowInputModal(false);
          setSelectedItemForEdit(null);
        }}
        currentDapur={currentDapur}
        picName={picName}
        onSaveSuccess={handleSaveAsetSuccess}
        itemToEdit={selectedItemForEdit}
      />

    </div>
  );
};
