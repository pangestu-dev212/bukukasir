'use client';

import React, { useState } from 'react';
import {
  Store,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Users2,
  TrendingUp,
  MessageCircle,
  PiggyBank,
  Coffee,
  Check,
} from 'lucide-react';
import { BUSINESS_TYPES, UserAccount } from '@/lib/types';
import { LocalStore } from '@/lib/storage';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin1234');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register Form
  const [regStoreName, setRegStoreName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('WARUNG');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('admin1234');
  const [regConfirmPassword, setRegConfirmPassword] = useState('admin1234');
  const [showRegPass, setShowRegPass] = useState(false);

  // Loading & Error States
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick autofill for default admin
  const handleUseAdminDefault = () => {
    setLoginUsername('admin');
    setLoginPassword('admin1234');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const localRes = LocalStore.login(loginUsername, loginPassword);
      if (localRes.success && localRes.user) {
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            username: loginUsername,
            password: loginPassword,
          }),
        }).catch(() => {});

        onLoginSuccess(localRes.user);
        return;
      }

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            username: loginUsername,
            password: loginPassword,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const currentAccounts = LocalStore.getAccounts();
          if (!currentAccounts.some((a) => a.username.toLowerCase() === data.user.username.toLowerCase())) {
            currentAccounts.push({
              ...data.user,
              password: loginPassword,
            });
            LocalStore.saveAccounts(currentAccounts);
          }
          LocalStore.setCurrentUser(data.user);
          onLoginSuccess(data.user);
          return;
        } else {
          setErrorMessage(data.error || 'Username atau password salah.');
        }
      } catch {
        setErrorMessage(localRes.error || 'Username atau password salah.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regStoreName.trim()) {
      setErrorMessage('Nama Toko / Usaha wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Username login wajib diisi.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMessage('Password minimal 4 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            username: regUsername.trim(),
            password: regPassword.trim(),
            name: regOwnerName.trim() || regUsername.trim(),
            storeName: regStoreName.trim(),
            businessType: regBusinessType,
            phone: regPhone.trim() || undefined,
          }),
        });
        const resData = await res.json();
        if (!resData.success) {
          setErrorMessage(resData.error || 'Gagal mendaftar di server');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('API error, falling back to local registration:', e);
      }

      const localRes = LocalStore.register({
        username: regUsername.trim(),
        password: regPassword.trim(),
        name: regOwnerName.trim() || regUsername.trim(),
        storeName: regStoreName.trim(),
        businessType: regBusinessType,
        phone: regPhone.trim() || undefined,
      });

      if (!localRes.success || !localRes.user) {
        setErrorMessage(localRes.error || 'Gagal mendaftar akun lokal');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(localRes.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

      {/* Floating Animated Ambient Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none animate-float-slow" />
      <div className="absolute -bottom-32 -right-32 w-[460px] h-[460px] bg-teal-500/15 rounded-full blur-[110px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[340px] h-[340px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse-glow" />

      {/* Floating Decorative Badges (Desktop Only) */}
      <div className="hidden xl:flex items-center gap-2 absolute top-12 left-16 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg animate-float-slow">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        ⚡ Rekap Kasir ke WhatsApp 1 Klik
      </div>
      <div className="hidden xl:flex items-center gap-2 absolute bottom-12 left-20 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-lg animate-float-reverse">
        <PiggyBank className="w-3.5 h-3.5 text-purple-400" />
        Kas Toko & Uang Dapur Terpisah
      </div>

      {/* Main Container - Responsive Dual Column */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Branding & Human Indonesian Pitch */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          {/* Brand Logo & Active Pill */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300/40 transform hover:rotate-6 transition duration-300">
              <Store className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Buku<span className="text-emerald-400">Kasir</span>
                </span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Pencatatan Kas & Kasir Warung Harian
              </p>
            </div>
          </div>

          {/* Main Headline (Human, Non-Robotic) */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Buku Kas Simpel Buat Yang <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Males Ribet</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Uang dagangan aman, uang dapur nggak bakal kepake. Catat kasir harian, tagih utang kasbon pelanggan, dan pantau untung bersih tanpa pusing hitung manual tiap malam.
            </p>
          </div>

          {/* 3 Value Cards */}
          <div className="grid grid-cols-1 gap-2.5 pt-1 text-left">
            <div className="flex items-start gap-3 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 p-3 rounded-2xl backdrop-blur-md transition group">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Uang Toko & Dompet Pisah
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-semibold">Bebas Bocor</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Tahu pasti omset bersih warung tanpa takut kepake buat belanja lauk atau uang jajan anak.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 p-3 rounded-2xl backdrop-blur-md transition group">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Catat Kasbon Nggak Bakal Lupa
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">Ada Notif</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Pelanggan ngutang tinggal ketik. Ada catatan cicilan dan tombol kirim rincian tagihan via WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 p-3 rounded-2xl backdrop-blur-md transition group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <Users2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Bebas Dipakai Siapa Saja
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">Mandiri</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Bisa daftar toko sendiri gratis tanpa ketergantungan. Data masing-masing toko terisolasi aman.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="pt-1 flex items-center justify-center lg:justify-start gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              Dipakai untuk:
            </span>
            <span className="text-slate-400 truncate">Warung kelontong, kuliner, bengkel, laundry & toko baju</span>
          </div>
        </div>

        {/* Right Column: Sleek Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-950/40 border border-slate-200 overflow-hidden text-slate-900 transform transition-all">
            
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTab('LOGIN');
                  setErrorMessage('');
                }}
                className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'LOGIN'
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-600" />
                Masuk Kasir
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('REGISTER');
                  setErrorMessage('');
                }}
                className={`py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  tab === 'REGISTER'
                    ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Buka Toko Baru
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold flex items-start gap-2 animate-in fade-in">
                <span className="shrink-0 text-rose-600 text-sm">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* =========================================
                TAB 1: FORM LOGIN
            ========================================= */}
            {tab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-4">
                {/* Demo Account Box */}
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 text-xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <p className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Mau coba langsung? Pakai akun demo:
                    </p>
                    <div className="text-[11px] text-slate-700 mt-1 flex items-center gap-2 flex-wrap">
                      <span>User: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-slate-950 font-bold">admin</strong></span>
                      <span>Pass: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-slate-950 font-bold">admin1234</strong></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseAdminDefault}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-sm transition shrink-0 cursor-pointer"
                  >
                    Coba Akun Demo
                  </button>
                </div>

                {/* Input Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Username / ID Toko
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Ketik username Anda (contoh: admin)"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition placeholder:text-slate-400"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full pl-10 pr-10 py-3 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition placeholder:text-slate-400"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showLoginPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-700/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <span>Membuka Kasir...</span>
                  ) : (
                    <>
                      <span>Masuk ke Buku Kasir</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-600">
                    Belum punya buku toko sendiri?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('REGISTER')}
                      className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Buka Toko Baru Gratis
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* =========================================
                TAB 2: FORM REGISTRASI MANDIRI
            ========================================= */}
            {tab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-7 space-y-3.5 max-h-[75vh] overflow-y-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950">
                  <p className="font-extrabold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Daftar Buku Kasir Mandiri
                  </p>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                    Setiap toko punya pembukuan mandiri yang terpisah aman. Kamu bisa langsung kelola kas tokomu sendiri tanpa ketergantungan.
                  </p>
                </div>

                {/* Nama Toko */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nama Toko / Warung Kamu *
                  </label>
                  <input
                    type="text"
                    required
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    placeholder="Contoh: Warung Bu Siti / Bengkel Maju / Kedai Kopi"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 placeholder:text-slate-400"
                  />
                </div>

                {/* Nama Pemilik & Jenis Usaha */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="Contoh: Bu Siti"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Jenis Usaha
                    </label>
                    <select
                      value={regBusinessType}
                      onChange={(e) => setRegBusinessType(e.target.value)}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-2.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    >
                      {BUSINESS_TYPES.map((bt) => (
                        <option key={bt.id} value={bt.id} className="text-slate-900 bg-white">
                          {bt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Username / ID Kasir (Huruf kecil tanpa spasi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Contoh: siti / warung_siti"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold font-mono text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                  />
                </div>

                {/* No WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    No. WhatsApp (Buat kirim rekap kasbon)
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                    className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Kata Sandi *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 4 karakter"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full px-3 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 pr-8 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass(!showRegPass)}
                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Ulangi Sandi *
                    </label>
                    <input
                      type={showRegPass ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang sandi"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3 py-2.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Tombol Daftar */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
                >
                  {isLoading ? (
                    <span>Menyiapkan Toko Baru...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Buka Toko & Mulai Catat</span>
                    </>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <p className="text-xs text-slate-600">
                    Sudah punya akun kasir?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('LOGIN')}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center mt-5 text-[11px] text-slate-400">
            BukuKasir • Catatan Kas & Kasir Warung Simpel untuk UMKM
          </div>
        </div>
      </div>
    </div>
  );
}
