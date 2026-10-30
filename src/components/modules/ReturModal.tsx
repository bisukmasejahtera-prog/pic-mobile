import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Camera } from 'lucide-react';
import { PenerimaanItem } from '../../types';

interface ReturModalProps {
  item: PenerimaanItem | null;
  onClose: () => void;
  onSubmitRetur: (itemId: string, returKg: number, alasan: string, tindakan: string) => void;
}

export const ReturModal: React.FC<ReturModalProps> = ({
  item,
  onClose,
  onSubmitRetur
}) => {
  if (!item) return null;

  const [returKg, setReturKg] = useState<number>(1);
  const [alasan, setAlasan] = useState<string>('Kondisi fisik berbau / tidak segar');
  const [tindakan, setTindakan] = useState<string>('potong_tagihan');

  const alasanOptions = [
    'Kondisi fisik berbau / tidak segar',
    'Susut timbangan melebihi toleransi wajar',
    'Kemasan sobek / kontaminasi silang',
    'Suhu rantai dingin melebihi batas standar (>4°C)',
    'Ukuran / spesifikasi tidak sesuai standar menu BGN'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRetur(item.id, returKg, alasan, tindakan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Berita Acara Retur / Karantina Bahan
              </h3>
              <p className="text-xs text-red-700 font-medium">
                {item.nama_bahan}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          
          {/* Target and Total Quantity */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-gray-500 block">Total Diterima Nota</span>
              <strong className="text-gray-900 font-bold">{item.target_po_kg} {item.satuan}</strong>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block">Hasil Timbangan Riil</span>
              <strong className="text-gray-900 font-bold">{item.timbangan_riil_kg} {item.satuan}</strong>
            </div>
          </div>

          {/* Jumlah yang Diretur */}
          <div>
            <label htmlFor="input-retur-kg" className="text-xs font-bold text-gray-700 block mb-1.5">
              Jumlah Komoditas yang Diretur / Ditolak ({item.satuan})
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-retur-kg"
                name="retur_kg"
                type="number"
                step="0.1"
                min="0.1"
                max={item.target_po_kg}
                value={returKg}
                onChange={(e) => setReturKg(Number(e.target.value))}
                className="w-full text-base font-bold bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                required
              />
              <span className="text-xs font-bold text-gray-600 px-3 py-2 bg-gray-100 rounded-xl border border-gray-200">
                {item.satuan}
              </span>
            </div>
          </div>

          {/* Alasan Retur */}
          <div>
            <label htmlFor="select-retur-alasan" className="text-xs font-bold text-gray-700 block mb-1.5">
              Alasan Penolakan / Retur
            </label>
            <select
              id="select-retur-alasan"
              name="alasan_retur"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-red-500"
            >
              {alasanOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Tindakan Korektif */}
          <div>
            <span className="text-xs font-bold text-gray-700 block mb-1.5">
              Tindakan Korektif Terhadap Supplier
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label htmlFor="radio-retur-potong" className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                tindakan === 'potong_tagihan'
                  ? 'bg-red-50 border-red-300 text-red-950 font-bold'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}>
                <input
                  id="radio-retur-potong"
                  type="radio"
                  name="tindakan_retur"
                  value="potong_tagihan"
                  checked={tindakan === 'potong_tagihan'}
                  onChange={() => setTindakan('potong_tagihan')}
                  className="sr-only"
                />
                <span>Potong Tagihan DO</span>
                <span className="text-[10px] text-gray-500 font-normal">Kuantitas invoice UD dikurangi</span>
              </label>

              <label htmlFor="radio-retur-ganti" className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                tindakan === 'ganti_segera'
                  ? 'bg-red-50 border-red-300 text-red-950 font-bold'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}>
                <input
                  id="radio-retur-ganti"
                  type="radio"
                  name="tindakan_retur"
                  value="ganti_segera"
                  checked={tindakan === 'ganti_segera'}
                  onChange={() => setTindakan('ganti_segera')}
                  className="sr-only"
                />
                <span>Minta Penggantian Segera</span>
                <span className="text-[10px] text-gray-500 font-normal">Kurir wajib kirim ulang subuh ini</span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>
              Berita Acara ini akan otomatis tercatat di rekonsiliasi tagihan UD/Koperasi pada ERP Desktop Yayasan.
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[1.5] py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer min-h-[44px]"
            >
              Simpan Berita Acara Retur
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
