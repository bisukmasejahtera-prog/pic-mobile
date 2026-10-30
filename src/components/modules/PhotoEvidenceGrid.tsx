import React, { useRef } from 'react';
import { Camera, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';

interface PhotoEvidenceGridProps {
  photoUrls: string[];
  onAddPhoto: (url: string) => void;
  onRemovePhoto: (index: number) => void;
  isManualMode?: boolean;
}

export const PhotoEvidenceGrid: React.FC<PhotoEvidenceGridProps> = ({
  photoUrls,
  onAddPhoto,
  onRemovePhoto,
  isManualMode = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slotLabels = isManualMode
    ? ['Foto Nota / Struk / Kuitansi', 'Foto Timbangan Fisik', 'Foto Fisik Komoditas']
    : ['Foto Surat Jalan / DO', 'Foto Timbangan Lantai', 'Foto Fisik / Peti Box'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAddPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Audit & Kepatuhan Drive
          </span>
          <h3 className="text-sm font-bold text-[#111827]">
            Dokumentasi Bukti Foto Lapangan
          </h3>
        </div>

        <span className="text-[11px] font-bold text-gray-500 bg-[#F3F4F6] px-2 py-0.5 rounded-md">
          {photoUrls.length}/3 Foto
        </span>
      </div>

      <input
        id="input-photo-evidence-file"
        name="photo_evidence_file"
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Ambil atau unggah foto bukti bahan baku"
      />

      {/* 3-Column Horizontal Grid (Section 5.3) */}
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((idx) => {
          const hasPhoto = Boolean(photoUrls[idx]);
          const photoSrc = photoUrls[idx];
          const label = slotLabels[idx];

          if (hasPhoto) {
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden border border-emerald-500 shadow-xs group">
                  <img
                    src={photoSrc}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Hapus foto"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 text-center mt-1.5 truncate max-w-[80px]">
                  {label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-[76px] h-[76px] rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-500 bg-[#F9FAFB] hover:bg-gray-100 transition-all cursor-pointer group"
            >
              <Camera className="w-5 h-5 text-gray-400 group-hover:text-gray-600 mb-1" />
              <span className="text-[9px] font-black tracking-wider uppercase text-gray-500 group-hover:text-gray-700 text-center leading-tight">
                AMBIL FOTO QC
              </span>
              <span className="text-[8px] text-gray-400 text-center truncate max-w-[70px] mt-0.5">
                {label.replace('Foto ', '')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6B7280]">
        <span>Folder Drive: <strong className="text-gray-700">BAHAN_BAKU</strong></span>
        <span className="text-emerald-700 font-semibold">Tersimpan Otomatis Cloud</span>
      </div>

    </div>
  );
};
