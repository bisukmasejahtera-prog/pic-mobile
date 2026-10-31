import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  PackageCheck, 
  ArrowRight, 
  Plus, 
  History,
  FileCheck2
} from 'lucide-react';
import { KonfirmasiPenerimaanBahan, TabType } from '../../types';
import { formatDateIndo } from '../../utils/dateUtils';

interface ReceivingSuccessViewProps {
  konfirmasi: KonfirmasiPenerimaanBahan;
  onNavigateTab: (tab: TabType) => void;
  onAddNewItem: () => void;
}

export const ReceivingSuccessView: React.FC<ReceivingSuccessViewProps> = ({
  konfirmasi,
  onNavigateTab,
  onAddNewItem
}) => {
  const confirmTime = new Date(konfirmasi.waktu_konfirmasi);
  const timeFormatted = confirmTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5 pb-24 lg:pb-12 max-w-2xl mx-auto animate-fadeIn">
      
      {/* Success Hero Badge */}
      <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-600" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Penerimaan Terverifikasi
        </span>

        <h2 className="text-lg sm:text-2xl font-black text-[#111827] max-w-lg mx-auto leading-tight">
          Terima Kasih Sudah Submit Data Penerimaan Bahan Baku
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
          Seluruh bahan baku untuk menu <strong>{formatDateIndo(konfirmasi.tanggal_menu)}</strong> telah berhasil disahkan dan tersinkronkan ke Dashboard Tim Pusat Yayasan Bisukma.
        </p>

        {/* Digital BAP Certificate Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-gray-900">
                Berita Acara Penerimaan (BAP) Digital
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
              {konfirmasi.nomor_bap}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 block">Unit Dapur SPPG:</span>
              <strong className="text-gray-900 font-bold block truncate">{konfirmasi.dapur_nama}</strong>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 block">Waktu Pengesahan:</span>
              <strong className="text-gray-900 font-bold block">
                {formatDateIndo(konfirmasi.tanggal_penerimaan)} • {timeFormatted} WIB
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 block">Petugas PIC Pemeriksa:</span>
              <strong className="text-gray-900 font-bold block">{konfirmasi.pic_nama}</strong>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 block">Ringkasan Fisik:</span>
              <strong className="text-emerald-800 font-bold block">
                {konfirmasi.total_items} Komoditas ({konfirmasi.total_volume_kg} Kg)
              </strong>
            </div>

            {konfirmasi.catatan_ba && (
              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-200">
                <span className="text-[10px] text-gray-500 block">Catatan BAP PIC:</span>
                <p className="text-gray-800 italic text-[11px] mt-0.5">
                  "{konfirmasi.catatan_ba}"
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1 font-medium text-emerald-800">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Siap diproses oleh tim juru masak dapur
            </span>
            <span className="font-mono text-[10px] text-gray-400">
              Status: SAH
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          data-testid="btn-success-ke-beranda"
          onClick={() => onNavigateTab('beranda')}
          className="w-full py-3.5 px-4 rounded-xl bg-[#111827] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
        >
          <span>Kembali ke Beranda Utama</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            data-testid="btn-success-ke-riwayat"
            onClick={() => onNavigateTab('riwayat')}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <History className="w-4 h-4 text-gray-600" />
            <span>Lihat Riwayat Penerimaan</span>
          </button>

          <button
            type="button"
            data-testid="btn-success-input-tambahan"
            onClick={onAddNewItem}
            className="w-full py-3 px-4 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Input Bahan Tambahan</span>
          </button>
        </div>
      </div>

    </div>
  );
};
