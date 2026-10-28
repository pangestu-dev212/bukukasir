'use client';

import React, { useState, useEffect } from 'react';
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
  Sun,
  Moon,
  PiggyBank,
  Check,
} from 'lucide-react';
import { BUSINESS_TYPES, UserAccount } from '@/lib/types';
import { LocalStore } from '@/lib/storage';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  // Theme state: default 'light' (cerah)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  // Load saved theme preference (default to light)
  useEffect(() => {
    const saved = localStorage.getItem('bukukasir_theme');
    if (saved === 'dark') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('bukukasir_theme', next);
  };

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

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950 text-slate-100 bg-dark-pattern'
          : 'bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/40 text-slate-900 bg-light-pattern'
      }`}
    >
      {/* Top Clean Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight leading-none">
              Buku<span className="text-emerald-600">Kasir</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Versi UMKM
            </span>
          </div>
        </div>

        {/* Theme Switcher Toggle (Cerah / Gelap) */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer shadow-sm ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
          title="Klik untuk beralih mode cerah / gelap"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mode Cerah</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Human, Clean & Reassuring Content */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold border border-emerald-300/80">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Catatan Kasir & Buku Warung Harian
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1
                className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Uang Toko Aman, <br />
                <span className="text-emerald-600">Uang Dapur Nggak Kecampur</span>
              </h1>
              <p
                className={`text-xs sm:text-sm leading-relaxed max-w-lg mx-auto lg:mx-0 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Catat kasir harian, tagih utang kasbon pelanggan, dan pantau untung bersih warung tanpa pusing hitung manual tiap malam.
              </p>
            </div>

            {/* 3 Clean Structured Benefit Cards */}
            <div className="grid grid-cols-1 gap-2.5 pt-1 text-left">
              {/* Feature 1 */}
              <div
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                    : 'bg-white/90 border-slate-200/90 shadow-sm text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold flex items-center gap-2">
                    Kas Toko & Kas Rumah Tangga Terpisah
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">Toko</span>
                  </h2>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tahu pasti laba bersih dagangan tanpa takut kepake buat belanja lauk atau uang jajan anak.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                    : 'bg-white/90 border-slate-200/90 shadow-sm text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold flex items-center gap-2">
                    Catat Kasbon & Tagih ke WhatsApp
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Kasbon</span>
                  </h2>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Pelanggan ngutang tinggal ketik, ada riwayat bayar cicilan dan tombol kirim tagihan via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                    : 'bg-white/90 border-slate-200/90 shadow-sm text-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Users2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold flex items-center gap-2">
                    Bisa Buat Toko Sendiri Secara Mandiri
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Gratis</span>
                  </h2>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Siapapun bisa mendaftar toko sendiri dengan aman. Data keuangan tidak akan bercampur dengan toko lain.
                  </p>
                </div>
              </div>
            </div>

            {/* Reassuring note for common users */}
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ✓ Mudah untuk pemula &nbsp;•&nbsp; ✓ Cepat & Ringan di HP &nbsp;•&nbsp; ✓ Tidak butuh keahlian akuntansi
            </p>
          </div>

          {/* Right Column: Clean White Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div
              className={`rounded-3xl shadow-xl overflow-hidden border transition ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Tab Selector */}
              <div
                className={`grid grid-cols-2 p-1.5 border-b ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setTab('LOGIN');
                    setErrorMessage('');
                  }}
                  className={`py-3 text-xs sm:text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    tab === 'LOGIN'
                      ? isDark
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
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
                  className={`py-3 text-xs sm:text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    tab === 'REGISTER'
                      ? isDark
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Buka Toko Baru
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold flex items-start gap-2">
                  <span className="shrink-0 text-rose-600">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* =========================================
                  TAB 1: FORM LOGIN
              ========================================= */}
              {tab === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-4">
                  {/* Demo Helper Box */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold flex items-center gap-1 text-emerald-900 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Langsung coba tanpa daftar:
                      </p>
                      <div className="text-[11px] text-slate-700 mt-0.5 flex items-center gap-2">
                        <span>User: <strong className="font-mono bg-white px-1.5 py-0.2 rounded border border-emerald-300 text-slate-900">admin</strong></span>
                        <span>Pass: <strong className="font-mono bg-white px-1.5 py-0.2 rounded border border-emerald-300 text-slate-900">admin1234</strong></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseAdminDefault}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition shrink-0 cursor-pointer"
                    >
                      Pakai Akun Demo
                    </button>
                  </div>

                  {/* Input Username */}
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Username / ID Kasir
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Ketik username Anda (contoh: admin)"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full pl-9 pr-4 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition placeholder:text-slate-400"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Input Password */}
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
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
                        className="w-full pl-9 pr-10 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition placeholder:text-slate-400"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
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
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Belum punya buku toko sendiri?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('REGISTER')}
                        className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
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
                    <p className="font-bold flex items-center gap-1.5 text-amber-900 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Pendaftaran Mandiri & Gratis
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Kamu bisa langsung buka buku kas tokomu sendiri. Data tokomu tersimpan rapi dan aman.
                    </p>
                  </div>

                  {/* Nama Toko */}
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Nama Toko / Warung *
                    </label>
                    <input
                      type="text"
                      required
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      placeholder="Contoh: Warung Bu Siti / Bengkel Maju"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Nama Pemilik & Jenis Usaha */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Nama Pemilik
                      </label>
                      <input
                        type="text"
                        value={regOwnerName}
                        onChange={(e) => setRegOwnerName(e.target.value)}
                        placeholder="Contoh: Bu Siti"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Jenis Usaha
                      </label>
                      <select
                        value={regBusinessType}
                        onChange={(e) => setRegBusinessType(e.target.value)}
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full px-2 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
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
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Username / ID Kasir (Huruf kecil tanpa spasi) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Contoh: siti / warung_siti"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-semibold font-mono text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                    />
                  </div>

                  {/* No WhatsApp */}
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No. WhatsApp (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
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
                          className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 pr-8 placeholder:text-slate-400"
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
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        Ulangi Sandi *
                      </label>
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang sandi"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                        className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Tombol Daftar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                  >
                    {isLoading ? (
                      <span>Membuka Toko Baru...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Buka Toko & Mulai Catat</span>
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Sudah punya akun kasir?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('LOGIN')}
                        className="font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        Masuk di sini
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className={`text-center mt-4 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              BukuKasir • Catatan Kas & Kasir Warung Simpel untuk UMKM
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
