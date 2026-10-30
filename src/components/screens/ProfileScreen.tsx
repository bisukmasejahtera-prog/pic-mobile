import React from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  CheckCircle2,
  MapPin,
  Tag,
  LogOut
} from 'lucide-react';
import { Dapur } from '../../types';

interface ProfileScreenProps {
  currentDapur: Dapur;
  allDapurs?: Dapur[];
  onSelectDapur?: (dapur: Dapur) => void;
  picName?: string;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentDapur,
  allDapurs = [],
  onSelectDapur,
  picName = 'Budi Santoso, S.P',
  onLogout
}) => {
  return (
    <div className="space-y-4 sm:space-y-5 pb-24 lg:pb-8 max-w-2xl mx-auto">
      
      {/* User Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#111827] text-white flex items-center justify-center font-black text-xl shadow-xs">
            {picName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                {picName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                TERVERIFIKASI
              </span>
            </div>
            <p className="text-xs text-[#6B7280] font-medium">
              PIC Logistik & Penerimaan Gudang Dapur
            </p>
            <div className="text-[11px] text-gray-500 mt-1">
              ID Petugas: <span className="font-mono font-bold text-gray-800">PIC-LOG-TRT-08</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dapur Assignment (Static - PIC Assigned to 1 Kitchen Only) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Lokasi Penugasan
            </span>
            <h3 className="text-sm font-bold text-[#111827]">
              Unit Dapur SPPG Resmi
            </h3>
          </div>
          <Building2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#111827]">
              {currentDapur.nama}
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
              {currentDapur.kode_bgn}
            </span>
          </div>

          <div className="flex items-start gap-1.5 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span>{currentDapur.alamat}</span>
          </div>

          <div className="pt-2 border-t border-gray-200/60 text-xs text-gray-600 flex items-center justify-between">
            <span>Afiliasi Pengadaan:</span>
            <strong className="text-gray-900">
              {currentDapur.is_ud_yayasan_hub ? 'UD Bisukma Sejahtera' : 'Mitra UD/Koperasi Lokal'}
            </strong>
          </div>
        </div>

        {/* Kitchen Switcher */}
        {allDapurs && allDapurs.length > 1 && onSelectDapur && (
          <div className="pt-1">
            <label htmlFor="select-dapur-profile" className="block text-xs font-bold text-gray-700 mb-1.5">
              Ganti Unit Dapur Aktif:
            </label>
            <select
              id="select-dapur-profile"
              value={currentDapur.id}
              onChange={(e) => {
                const found = allDapurs.find(d => d.id === e.target.value);
                if (found) onSelectDapur(found);
              }}
              className="w-full py-2.5 px-3 bg-[#F9FAFB] border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-gray-500 cursor-pointer min-h-[44px]"
            >
              {allDapurs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama} ({d.kode_bgn})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              Pilih unit dapur untuk menyesuaikan pencatatan logistik dan laporan bahan masuk.
            </p>
          </div>
        )}
      </div>

      {/* Logout Action */}
      {onLogout && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun (Logout)</span>
          </button>
        </div>
      )}

      {/* App Version & Copyright */}
      <div className="text-center text-xs text-gray-500 pt-3 space-y-1">
        <div>PIC Mobile: Logistics & Receiving Module v1.0.0</div>
        <div className="font-semibold text-gray-700">© 2026 Bisukma Group</div>
      </div>

    </div>
  );
};
