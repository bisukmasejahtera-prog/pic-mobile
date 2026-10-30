import React from 'react';
import { X, CheckCircle2, Building2, Truck, Calendar, Clock, Scale, RotateCcw, ExternalLink, Thermometer, Camera } from 'lucide-react';
import { PenerimaanBahanItem } from '../../types';
import { getDriveDirectImageUrl, getDriveWebLink, GDRIVE_BAHAN_FOLDER_URL } from '../../utils/googleDrive';

interface BahanDetailModalProps {
  item: PenerimaanBahanItem | null;
  onClose: () => void;
}

export const BahanDetailModal: React.FC<BahanDetailModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                Laporan Bahan Masuk
              </span>
              {item.ada_retur ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                  ADA RETUR
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  DITERIMA PENUH
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">
              {item.nama_bahan_baku}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Main Key Figures */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <span className="text-gray-500 block text-[11px]">Jumlah Sampai</span>
              <span className="text-xl font-black text-gray-900">
                {item.jumlah_sampai} {item.satuan}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Jam Sampai</span>
              <span className="text-xl font-black text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
                {item.jam_sampai} WIB
              </span>
            </div>
          </div>

          {/* Supplier & Kitchen Metadata */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-white border border-gray-200">
            <div>
              <span className="text-gray-500 block text-[11px]">Mitra Supplier</span>
              <strong className="text-gray-900 font-bold block truncate">{item.nama_supplier}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Dapur SPPG</span>
              <strong className="text-gray-900 font-bold block truncate">{item.dapur_nama}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Tanggal Tiba</span>
              <strong className="text-gray-900 font-bold">{item.tanggal}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Petugas Penerima</span>
              <strong className="text-gray-900 font-bold">{item.pic_nama}</strong>
            </div>
            {item.suhu_celsius && (
              <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center gap-1 text-sky-800 font-bold">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Suhu Peti / Chiller: {item.suhu_celsius}°C</span>
              </div>
            )}
          </div>

          {/* Retur Section (If any) */}
          {item.ada_retur && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2 text-red-950">
              <div className="flex items-center justify-between font-bold text-red-900">
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" />
                  Rincian Retur Bahan
                </span>
                <span className="px-2 py-0.5 bg-red-200 text-red-900 rounded font-black">
                  {item.jumlah_retur} {item.satuan}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-red-700 block text-[11px]">Alasan Penolakan:</span>
                <p className="font-semibold">{item.alasan_retur || 'Bahan rusak / tidak memenuhi standar'}</p>
              </div>
              <div className="text-xs pt-1 border-t border-red-200/60">
                <span className="text-red-700 block text-[11px]">Jam Sampai Retur (Pengganti Tiba):</span>
                <p className="font-bold text-red-900">
                  {item.jam_sampai_retur ? `${item.jam_sampai_retur} WIB` : 'Belum tiba / Menunggu pengiriman suplier'}
                </p>
              </div>
            </div>
          )}

          {/* Catatan Petugas */}
          {item.catatan && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 block mb-0.5">Catatan Petugas</span>
              <p className="text-gray-800 italic">"{item.catatan}"</p>
            </div>
          )}

          {/* Photos */}
          {item.foto_urls && item.foto_urls.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900">
                  Foto Bukti Fisik Timbangan / Bahan ({item.foto_urls.length})
                </h4>
                <a
                  href={GDRIVE_BAHAN_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Folder Google Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {item.foto_urls.map((rawUrl, i) => {
                  const directImageUrl = getDriveDirectImageUrl(rawUrl, 600);
                  const webViewUrl = getDriveWebLink(rawUrl);

                  return (
                    <div 
                      key={i} 
                      className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square group bg-gray-100 flex items-center justify-center shadow-xs"
                    >
                      <img 
                        src={directImageUrl} 
                        alt={`Bukti Foto ${i + 1}`} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedBackup) {
                            target.dataset.triedBackup = 'true';
                            const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                            if (match && match[1]) {
                              target.src = `https://lh3.googleusercontent.com/d/${match[1]}=w600`;
                              return;
                            }
                          }
                          // Fallback to placeholder if external image tag is blocked
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.photo-fallback');
                          if (fallback) {
                            (fallback as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="photo-fallback hidden absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gray-100 text-gray-600"
                      >
                        <Camera className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[11px] font-bold text-gray-800">Bukti Foto {i + 1}</span>
                        <span className="text-[9px] text-sky-700 font-semibold mt-0.5">Buka di Drive &rarr;</span>
                      </div>
                      <a
                        href={webViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1"
                        title="Buka foto di Google Drive"
                      >
                        <ExternalLink className="w-5 h-5 text-white" />
                        <span className="text-[10px] font-bold">Buka di Drive</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
