import React from 'react';
import { X, CheckCircle2, Building2, Truck, Calendar, Clock, FileText, ExternalLink } from 'lucide-react';
import { PenerimaanBatch } from '../../types';

interface BatchDetailModalProps {
  batch: PenerimaanBatch | null;
  onClose: () => void;
}

export const BatchDetailModal: React.FC<BatchDetailModalProps> = ({
  batch,
  onClose
}) => {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-t-2xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                Bukti Penerimaan Logistik
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {batch.status.toUpperCase()}
              </span>
              {batch.is_manual_entry && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  INPUT MANUAL (TANPA SJ)
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-900 mt-0.5">
              {batch.no_surat_jalan}
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
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <span className="text-gray-500 block text-[11px]">Mitra Supplier</span>
              <strong className="text-gray-900 font-bold block truncate">{batch.vendor_nama}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Unit Dapur SPPG</span>
              <strong className="text-gray-900 font-bold block truncate">{batch.dapur_nama}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Waktu Kedatangan</span>
              <strong className="text-gray-900 font-bold">{batch.tanggal} • {batch.jam_tiba} WIB</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Petugas Penerima</span>
              <strong className="text-gray-900 font-bold">{batch.pic_nama}</strong>
            </div>
            {batch.alasan_manual && (
              <div className="col-span-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500 block text-[11px]">Alasan Penerimaan Manual</span>
                <span className="text-sky-800 font-semibold block">{batch.alasan_manual}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center justify-between">
              <span>Rincian Komoditas Bahan Baku</span>
              <span className="text-gray-500 font-normal">Total: {batch.total_berat_kg} Kg</span>
            </h4>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {batch.items.map((itm) => (
                <div key={itm.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-gray-900 truncate">{itm.nama_bahan}</span>
                      {itm.is_custom_item && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Manual
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {itm.has_target_po !== false 
                        ? `Target PO: ${itm.target_po_kg} ${itm.satuan}` 
                        : 'Tanpa Target PO (Acuan Riil)'} • Suhu: {itm.suhu_celsius ? `${itm.suhu_celsius}°C` : 'Ruang'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-gray-900 text-sm">
                      {itm.timbangan_riil_kg} {itm.satuan}
                    </div>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      itm.status_qc === 'cocok' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : itm.status_qc === 'susut_wajar'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {itm.status_qc.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          {batch.foto_urls && batch.foto_urls.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-2">
                Foto Bukti Fisik & Surat Jalan
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {batch.foto_urls.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square group">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {batch.catatan_petugas && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] text-gray-500 block mb-0.5 font-bold">Catatan Verifikasi</span>
              <p className="text-gray-800 text-xs italic">
                "{batch.catatan_petugas}"
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold cursor-pointer hover:bg-black"
          >
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
};
