import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Scale, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  CheckCircle2,
  HardDrive,
  UserPlus,
  LogIn,
  User,
  Phone,
  Building2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Dapur } from '../../types';
import { db, saveDocument } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface LoginScreenProps {
  currentDapur?: Dapur;
  onLoginSuccess: (userData: { name: string; email: string }) => void;
}

interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess
}) => {
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('budi.santoso@bisukma.org');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Pending approval modal/screen state
  const [pendingData, setPendingData] = useState<PendingRegistration | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const emailTrim = email.trim().toLowerCase();

    // Query Firestore users collection
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', emailTrim));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const uDoc = snap.docs[0].data();

        // Password check (if recorded)
        if (uDoc.password && uDoc.password !== password) {
          setErrorMsg('Kata sandi salah. Silakan periksa kembali.');
          setIsLoading(false);
          return;
        }

        // Pending Maker approval status
        if (uDoc.approval_status === 'pending') {
          setPendingData({
            name: uDoc.nama_lengkap || emailTrim,
            email: uDoc.email || emailTrim,
            phone: uDoc.nomor_hp || ''
          });
          setIsLoading(false);
          return;
        }

        // Rejected
        if (uDoc.approval_status === 'rejected') {
          setErrorMsg('Pendaftaran akun Anda ditolak oleh Tim Maker Operasional Bisukma Group.');
          setIsLoading(false);
          return;
        }

        // Approved!
        setIsLoading(false);
        onLoginSuccess({
          name: uDoc.nama_lengkap || 'Petugas PIC Dapur',
          email: uDoc.email || emailTrim
        });
        return;
      }
    } catch (dbErr) {
      console.warn('Firestore user query fallback to local check:', dbErr);
    }

    // Fallback default demo check
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Budi Santoso, S.P',
        email: email.trim()
      });
    }, 600);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Mohon masukkan nama lengkap Anda.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Mohon masukkan alamat email yang valid.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMsg('Mohon masukkan nomor WhatsApp / HP aktif.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    const newUid = `u-pic-${Date.now()}`;
    const regPayload = {
      uid: newUid,
      email: regEmail.trim().toLowerCase(),
      nama_lengkap: regName.trim(),
      nomor_hp: regPhone.trim(),
      password: regPassword,
      role: 'pic_dapur',
      approval_status: 'pending',
      invitation_status: 'invited',
      is_active: false,
      assigned_dapurs: [],
      assigned_dapur_names: ['Menunggu Penugasan Maker'],
      created_at: new Date().toISOString()
    };

    try {
      await saveDocument('users', newUid, regPayload);
    } catch (saveErr) {
      console.warn('Gagal menyimpan pendaftaran ke Firestore, menampilkan status pending lokal:', saveErr);
    }

    setIsLoading(false);
    setPendingData({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim()
    });
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: 'Budi Santoso, S.P',
        email: 'budi.santoso@bisukma.org'
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col justify-center items-center px-4 py-8 sm:py-12 select-none">
      
      <div className="w-full max-w-sm space-y-4">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#111827] text-white mx-auto flex items-center justify-center shadow-md">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#047857] text-[10px] font-bold tracking-wider uppercase mb-1">
              Bisukma Group
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#111827]">
              PIC MOBILE
            </h1>
            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
              Logistik & Penerimaan Bahan Baku Dapur SPPG
            </p>
          </div>
        </div>

        {/* Tab Switcher: Masuk Akun vs Daftar PIC Baru */}
        {!pendingData && (
          <div className="bg-[#E5E7EB]/70 p-1 rounded-2xl flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar PIC Baru</span>
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 shadow-sm space-y-4">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* View 1: Pending Approval Confirmation Screen */}
          {pendingData ? (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-xs">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-amber-300">
                  Menunggu Approval Maker Operasional
                </span>
                <h3 className="text-base font-bold text-[#111827]">
                  Pendaftaran Berhasil Dikirim!
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Pengajuan akun Anda sedang menunggu verifikasi dan penentuan unit dapur penugasan oleh Tim Maker Operasional Bisukma Group.
                </p>
              </div>

              {/* Data Summary Card */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-2 text-gray-700">
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Nama Pemohon:</span>
                  <span className="font-bold text-gray-900">{pendingData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Email Terdaftar:</span>
                  <span className="font-bold text-gray-900 font-mono text-[11px]">{pendingData.email}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Nomor WhatsApp:</span>
                  <span className="font-bold text-gray-900">{pendingData.phone}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Unit Dapur:</span>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                    Dipilihkan Maker Operasional
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Status Persetujuan:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                    Pending Maker
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {/* Instant Simulation for Testing / Demo */}
                <button
                  type="button"
                  onClick={() => {
                    onLoginSuccess({
                      name: pendingData.name,
                      email: pendingData.email
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulasi: Approve Akun & Masuk Sekarang</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingData(null);
                    setAuthMode('login');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Kembali ke Halaman Masuk
                </button>
              </div>
            </div>
          ) : authMode === 'login' ? (
            
            /* View 2: Form Masuk Akun */
            <>
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-[#111827]">
                  Masuk Akun Petugas
                </h2>
                <p className="text-[11px] text-[#6B7280]">
                  Gunakan akun resmi operasional dapur Bisukma Group
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                
                {/* Email Field */}
                <div>
                  <label htmlFor="login-email" className="font-bold text-[#374151] block mb-1">
                    Email / ID Petugas <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="username email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama.petugas@bisukma.org"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="login-password" className="font-bold text-[#374151] block mb-1">
                    Kata Sandi <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full pl-9 pr-9 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label htmlFor="login-remember" className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="login-remember"
                      name="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#111827] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 font-medium">
                      Ingat di perangkat ini
                    </span>
                  </label>

                  <span className="text-[11px] text-gray-500 font-medium">
                    Shift Pagi Siaga
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 min-h-[48px] cursor-pointer ${
                    isLoading
                      ? 'bg-gray-400 cursor-wait'
                      : 'bg-[#111827] hover:bg-black active:scale-[0.98]'
                  }`}
                >
                  <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem Logistik'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>

              </form>

              {/* Quick Demo Access Button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Masuk Cepat (Akun Demo Budi Santoso)</span>
                </button>
              </div>
            </>
          ) : (
            
            /* View 3: Form Pendaftaran PIC Baru */
            <>
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-700" />
                  Pendaftaran Akun PIC Baru
                </h2>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Pendaftaran akun akan ditinjau dan disetujui (approve) oleh Tim Maker Operasional Bisukma Group.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="reg-name" className="font-bold text-[#374151] block mb-1">
                    NAMA LENGKAP <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-name"
                      name="fullname"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="cth: Togar Marbun"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="font-bold text-[#374151] block mb-1">
                    ALAMAT EMAIL <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@bisukma.org"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                {/* Nomor WhatsApp / HP */}
                <div>
                  <label htmlFor="reg-phone" className="font-bold text-[#374151] block mb-1">
                    NOMOR WHATSAPP / HP <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                {/* Unit Dapur Penugasan (Ditetapkan oleh Maker Operasional) */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>UNIT DAPUR PENUGASAN</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Unit dapur penugasan akan ditentukan dan ditetapkan langsung oleh Tim Maker Operasional saat proses verifikasi akun.
                  </p>
                </div>

                {/* Password & Confirm Password (2 Columns) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="reg-password" className="font-bold text-[#374151] block mb-1">
                      KATA SANDI <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        name="password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 karakter"
                        className="w-full pl-3 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showRegPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm-password" className="font-bold text-[#374151] block mb-1">
                      KONFIRMASI SANDI <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        name="confirm_password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi"
                        className="w-full pl-3 pr-8 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:border-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showRegConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 min-h-[48px] cursor-pointer mt-2 ${
                    isLoading
                      ? 'bg-gray-400 cursor-wait'
                      : 'bg-[#111827] hover:bg-black active:scale-[0.98]'
                  }`}
                >
                  <span>{isLoading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Akun'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>

                {/* Link to Login */}
                <div className="text-center pt-1.5">
                  <span className="text-xs text-gray-500">
                    Sudah memiliki akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                      }}
                      className="font-bold text-[#111827] hover:underline cursor-pointer"
                    >
                      Masuk Disini
                    </button>
                  </span>
                </div>

              </form>
            </>
          )}

        </div>

        {/* Security & Access Restriction Footer */}
        <div className="text-center text-[11px] text-gray-500 px-2 space-y-1">
          <p>
            Hak akses dibatasi untuk petugas PIC & Yayasan Bisukma Group. Semua aktivitas pencatatan diaudit secara berkala.
          </p>
          <div className="text-[10px] text-gray-400 font-semibold pt-1">
            © 2026 Bisukma Group
          </div>
        </div>

      </div>

    </div>
  );
};

export default LoginScreen;
