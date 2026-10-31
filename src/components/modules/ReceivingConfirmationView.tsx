import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Scale, 
  Thermometer, 
  FileText, 
  ShieldCheck, 
  Loader2,
  PackageCheck
} from 'lucide-react';
import { Dapur, PenerimaanBahanItem, KonfirmasiPenerimaanBahan } from '../../types';
import { formatDateIndo } from '../../utils/dateUtils';
import { getDriveDirectImageUrl } from '../../utils/googleDrive';
import { saveDocument } from '../../lib/firebase';

interface ReceivingConfirmationViewProps {
  currentDapur: Dapur;
  picName: string;
  tanggalPenerimaan: string;
  tanggalMenu: string;
  items: PenerimaanBahanItem[];
  onBackToForm: () => void;
  onConfirmSuccess: (konfirmasi: KonfirmasiPenerimaanBahan) => void;
}

export const ReceivingConfirmationView: React.FC<ReceivingConfirmationViewProps> = ({
  currentDapur,
  picName,
  tanggalPenerimaan,
  tanggalMenu,
  items,
  onBackToForm,
  onConfirmSuccess
}) => {
  const [catatanBA, setCatatanBA] = useState('');
  const [isStatementAgreed, setIsStatementAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute metrics
  const totalVolumeKg = items.reduce((acc, i) => acc + (Number(i.jumlah_sampai) || 0), 0);
  const returItems = items.filter(i => i.ada_retur);
  const totalReturKg = returItems.reduce((acc, i) => acc + (Number(i.jumlah_retur) || 0), 0);

  const handleSubmitConfirmation = async () => {
    if (!isStatementAgreed) {
      setErrorMessage('Mohon centang pernyataan pemeriksaan fisik sebelum mengirim konfirmasi.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Belum ada data bahan baku untuk dikonfirmasi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const now = new Date();
      const dateCompact = tanggalMenu.replace(/[^0-9]/g, '');
      const randSuffix = String(Math.floor(1000 + Math.random() * 9000));
      const kodeBgn = currentDapur.kode_bgn || 'SPPG';
      const nomorBAP = `BAP-${kodeBgn}-${dateCompact}-${randSuffix}`;
      const docId = `KNF-${currentDapur.id}-${tanggalMenu}`;

      const konfirmasiDoc: KonfirmasiPenerimaanBahan = {
        id: docId,
        dapur_id: currentDapur.id,
        dapur_nama: currentDapur.nama,
        tanggal_penerimaan: tanggalPenerimaan,
        tanggal_menu: tanggalMenu,
        pic_nama: picName,
        nomor_bap: nomorBAP,
        total_items: items.length,
        total_volume_kg: Number(totalVolumeKg.toFixed(1)),
        total_retur_count: returItems.length,
        total_retur_kg: Number(totalReturKg.toFixed(1)),
        catatan_ba: catatanBA.trim() || undefined,
        waktu_konfirmasi: now.toISOString(),
        status: 'selesai_diterima',
        items_snapshot: items
      };

      // Persist to Firestore collection 'konfirmasi_penerimaan' with offline resilience
      try {
        await saveDocument('konfirmasi_penerimaan', konfirmasiDoc.id, konfirmasiDoc);
      } catch (err) {
        console.warn('Sync Firestore konfirmasi_penerimaan fallback:', err);
      }

      // Persist to localStorage for immediate offline recall
      try {
        const storageKey = `pic_mobile_knf_${currentDapur.id}_${tanggalMenu}`;
        localStorage.setItem(storageKey, JSON.stringify(konfirmasiDoc));
      } catch {
        // ignore
      }

      onConfirmSuccess(konfirmasiDoc);
    } catch (err: unknown) {
      console.error('Submit confirmation error:', err);
      setErrorMessage('Terjadi kendala saat memproses konfirmasi. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 lg:pb-12 max-w-2xl mx-auto animate-fadeIn">
      
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToForm}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-all cursor-pointer shrink-0 min-h-[44px]"
          title="Kembali ke form input bahan"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Pemeriksaan Akhir & Berita Acara
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[#111827] leading-tight">
            Konfirmasi Penerimaan Seluruh Bahan Baku
          </h2>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Kitchen & Menu Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Lokasi Dapur SPPG
              </span>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                {currentDapur.nama}
              </h3>
              <span className="text-[11px] font-mono text-gray-500">
                Kode BGN: {currentDapur.kode_bgn}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
            Pemeriksaan PIC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2.5 rounded-xl">
            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 block">Jadwal Menu Masak:</span>
              <strong className="font-bold text-gray-900">{formatDateIndo(tanggalMenu)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2.5 rounded-xl">
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 block">Petugas PIC Pemeriksa:</span>
              <strong className="font-bold text-gray-900">{picName}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center shadow-2xs">
          <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
            Total Bahan
          </span>
          <span className="text-lg sm:text-xl font-black text-gray-900 block mt-0.5">
            {items.length}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Komoditas</span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center shadow-2xs">
          <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
            Total Volume
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 block mt-0.5">
            {totalVolumeKg.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Kilogram/Unit</span>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl border text-center shadow-2xs ${
          returItems.length > 0 
            ? 'bg-amber-50 border-amber-300 text-amber-950' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <span className="text-[10px] font-bold block uppercase tracking-wider text-gray-500">
            Status Retur
          </span>
          <span className={`text-lg sm:text-xl font-black block mt-0.5 ${
            returItems.length > 0 ? 'text-amber-800' : 'text-emerald-700'
          }`}>
            {returItems.length > 0 ? `${returItems.length} Retur` : '0 Retur'}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            {returItems.length > 0 ? `${totalReturKg.toFixed(1)} kg ditolak` : 'Kualitas Baik'}
          </span>
        </div>
      </div>

      {/* Items Verification Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
              Daftar Bahan Siap Disahkan ({items.length} Item)
            </h4>
          </div>
          <button
            type="button"
            onClick={onBackToForm}
            className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
          >
            + Tambah/Ubah
          </button>
        </div>

        <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">
                    {item.nama_bahan_baku}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Supplier: {item.nama_supplier} • Jam: {item.jam_sampai} WIB
                  </div>
                  {item.suhu_celsius !== undefined && (
                    <div className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                      <Thermometer className="w-3 h-3 text-emerald-600" />
                      <span>Suhu Cold-chain: {item.suhu_celsius}°C</span>
                    </div>
                  )}
                  {item.ada_retur && (
                    <div className="text-[10px] text-red-800 bg-red-50 p-1.5 rounded-lg border border-red-200 mt-1 font-semibold">
                      Retur: {item.jumlah_retur} {item.satuan} ({item.alasan_retur})
                    </div>
                  )}
                  {item.catatan && (
                    <div className="text-[10px] text-gray-600 italic mt-0.5">
                      Catatan: "{item.catatan}"
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-black text-gray-900 text-xs sm:text-sm block">
                  {item.jumlah_sampai} {item.satuan}
                </span>
                {item.foto_urls && item.foto_urls.length > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mt-1">
                    ✓ {item.foto_urls.length} Foto Bukti
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catatan Berita Acara Penerimaan (Opsional) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-2">
        <label htmlFor="catatan-ba" className="block text-xs font-bold text-gray-900">
          Catatan Berita Acara Penerimaan (Opsional)
        </label>
        <textarea
          id="catatan-ba"
          rows={3}
          value={catatanBA}
          onChange={(e) => setCatatanBA(e.target.value)}
          placeholder="Contoh: Seluruh bahan telah ditimbang di timbangan lantai dapur, sayuran segar, kemasan tersegel rapi..."
          className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-600"
        />
        <p className="text-[11px] text-gray-500">
          Catatan ini akan tercatat resmi pada Berita Acara Penerimaan (BAP) dan dapat dibaca oleh tim akuntansi dan logistik pusat.
        </p>
      </div>

      {/* Statement Agreement Checkbox */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            data-testid="checkbox-agreement-konfirmasi"
            checked={isStatementAgreed}
            onChange={(e) => setIsStatementAgreed(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-gray-300 mt-0.5 shrink-0 cursor-pointer"
          />
          <span className="text-xs font-semibold text-emerald-950 leading-relaxed">
            Saya menyatakan bahwa seluruh barang yang terdaftar telah saya periksa secara fisik, ditimbang, dan diterima lengkap di unit dapur untuk dimasak pada menu tanggal <strong>{formatDateIndo(tanggalMenu, { withDayName: false })}</strong>.
          </span>
        </label>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Pengesahan ini berlaku sebagai Berita Acara Penerimaan Digital SPPG Bisukma.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <button
          type="button"
          onClick={onBackToForm}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[48px]"
        >
          ← Periksa Kembali
        </button>

        <button
          type="button"
          data-testid="btn-submit-konfirmasi-final"
          disabled={isSubmitting || !isStatementAgreed}
          onClick={handleSubmitConfirmation}
          className="flex-1 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Memproses Berita Acara...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Sahkan & Selesaikan Penerimaan</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
