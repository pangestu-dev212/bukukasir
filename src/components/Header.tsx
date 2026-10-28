import React, { useState, useRef, useEffect } from 'react';
import { Store, Calendar, Share2, Download, BookOpen, ChevronDown, Pencil, LogOut, User, Cloud, RefreshCw, MoreVertical, CheckCircle2, Clock } from 'lucide-react';
import { StoreProfile, DateFilter, DateFilterMode, UserAccount } from '@/lib/types';
import { formatDateRangeLabel, getTodayDateString, getYesterdayDateString, getLast7DaysRange, getThisMonthRange } from '@/lib/formatters';

interface HeaderProps {
  activeStore: StoreProfile;
  currentUser?: UserAccount | null;
  dateFilter: DateFilter;
  onChangeDateFilter: (filter: DateFilter) => void;
  onOpenStoreSwitcher: () => void;
  onEditActiveStore: () => void;
  onOpenWhatsApp: () => void;
  onExportExcel: () => void;
  onOpenDebts: () => void;
  onLogout: () => void;
  debtCount: number;
  isSyncing?: boolean;
  onTriggerSync?: () => void;
}

export function Header({
  activeStore,
  currentUser,
  dateFilter,
  onChangeDateFilter,
  onOpenStoreSwitcher,
  onEditActiveStore,
  onOpenWhatsApp,
  onExportExcel,
  onOpenDebts,
  onLogout,
  debtCount,
  isSyncing,
  onTriggerSync,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [realtimeClock, setRealtimeClock] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Jam realtime digital (update setiap detik, sinkron langsung dengan jam HP masing-masing)
  useEffect(() => {
    const getTimezoneSuffix = (d: Date) => {
      const offsetHours = -d.getTimezoneOffset() / 60;
      if (offsetHours === 7) return 'WIB';
      if (offsetHours === 8) return 'WITA';
      if (offsetHours === 9) return 'WIT';
      return offsetHours >= 0 ? `GMT+${offsetHours}` : `GMT${offsetHours}`;
    };

    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const tz = getTimezoneSuffix(now);
      setRealtimeClock(`${h}:${m}:${s} ${tz}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handlePresetClick = (mode: DateFilterMode) => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (mode === 'TODAY') {
      onChangeDateFilter({ mode: 'TODAY', startDate: today, endDate: today });
    } else if (mode === 'YESTERDAY') {
      onChangeDateFilter({ mode: 'YESTERDAY', startDate: yesterday, endDate: yesterday });
    } else if (mode === 'LAST_7') {
      const range = getLast7DaysRange();
      onChangeDateFilter({
        mode: 'LAST_7',
        startDate: range.startDate,
        endDate: range.endDate,
      });
    } else if (mode === 'THIS_MONTH') {
      const range = getThisMonthRange();
      onChangeDateFilter({
        mode: 'THIS_MONTH',
        startDate: range.startDate,
        endDate: range.endDate,
      });
    } else if (mode === 'CUSTOM') {
      onChangeDateFilter({
        mode: 'CUSTOM',
        startDate: dateFilter.startDate || today,
        endDate: dateFilter.endDate || today,
      });
    }
  };

  return (
    <header className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white shadow-lg shadow-emerald-950/25 sticky top-0 z-30 border-b border-teal-500/30 relative">
      {/* Ambient background glow orbs */}
      <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-3 relative z-10">
        {/* Baris Atas: Info Toko (Lega) & Menu Aksi Terstruktur */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          {/* Sisi Kiri: Nama Toko Lega & Utuh */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <button
              onClick={onOpenStoreSwitcher}
              className="flex items-center gap-2.5 text-left hover:bg-white/10 p-1.5 -ml-1 rounded-2xl transition group min-w-0 flex-1 border border-transparent hover:border-white/15"
              title="Klik untuk ganti atau tambah buku toko"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 border border-white/30 flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/30">
                <Store className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-white drop-shadow truncate">
                    {activeStore.storeName || 'Buku Kasir'}
                  </h1>
                  <ChevronDown className="w-4 h-4 text-teal-300 group-hover:translate-y-0.5 transition shrink-0" />
                </div>
                <p className="text-[11px] sm:text-xs text-teal-100/90 font-medium truncate">
                  {activeStore.ownerName ? `Pemilik: ${activeStore.ownerName}` : 'Ganti Toko ▾'}
                </p>
              </div>
            </button>

            {/* Tombol Cepat Edit Nama Toko */}
            <button
              type="button"
              onClick={onEditActiveStore}
              className="p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-xl transition shrink-0"
              title="Edit Nama Toko / Usaha Ini"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sisi Kanan: Tombol Kasbon + Tombol Menu '...' */}
          <div className="flex items-center gap-1.5 shrink-0" ref={menuRef}>
            {/* Tombol Utama: Kasbon */}
            <button
              onClick={onOpenDebts}
              className="relative p-2 sm:px-3 bg-white/10 hover:bg-white/20 rounded-xl text-teal-100 transition border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Buku Utang & Kasbon"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Kasbon</span>
              {debtCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-emerald-900 shadow-md animate-pulse">
                  {debtCount}
                </span>
              )}
            </button>

            {/* Tombol Menu '...' Titik Tiga */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-xl transition border backdrop-blur-md flex items-center justify-center ${
                  isMenuOpen
                    ? 'bg-white text-emerald-900 border-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-teal-100 border-white/15 shadow-sm'
                }`}
                title="Menu Aksi & Pengaturan Toko"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Floating Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  {/* Info User / Toko Aktif */}
                  <div className="px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/50 mb-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Akun Kasir Aktif</p>
                    <p className="font-black text-slate-100 text-xs truncate">
                      {currentUser?.username || 'admin'}
                    </p>
                  </div>

                  {/* Tombol Kirim WA */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenWhatsApp();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:text-white hover:bg-emerald-600/30 hover:border-emerald-500/30 border border-transparent transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Kirim Rekap ke WA</span>
                  </button>

                  {/* Tombol Unduh Excel */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onExportExcel();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:text-white hover:bg-blue-600/30 hover:border-blue-500/30 border border-transparent transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    <span>Unduh Laporan Excel</span>
                  </button>

                  {/* Tombol Sinkronisasi Cloud */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onTriggerSync) onTriggerSync();
                    }}
                    disabled={isSyncing}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-bold text-slate-200 hover:text-white hover:bg-cyan-600/30 hover:border-cyan-500/30 border border-transparent transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse text-amber-300' : ''}`} />
                      </div>
                      <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Cloud'}</span>
                    </div>
                    {isSyncing && (
                      <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    )}
                  </button>

                  <div className="border-t border-slate-700/60 my-1 pt-1" />

                  {/* Ganti Buku Toko */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenStoreSwitcher();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <span>Ganti / Tambah Toko</span>
                  </button>

                  {/* Edit Profil Toko */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEditActiveStore();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                    <span>Edit Profil Usaha</span>
                  </button>

                  <div className="border-t border-slate-700/60 my-1 pt-1" />

                  {/* Tombol Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold text-rose-300 hover:text-white hover:bg-rose-600/80 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Baris Bawah: FILTER PERIODE TANGGAL (Hari Ini, Kemarin, 7 Hari, Bulan Ini, Rentang) */}
        <div className="pt-2.5 space-y-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button
              type="button"
              onClick={() => handlePresetClick('TODAY')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
                dateFilter.mode === 'TODAY'
                  ? 'bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 text-slate-950 font-black shadow-md shadow-emerald-950/40 scale-105'
                  : 'bg-white/10 text-teal-100 hover:bg-white/20 border border-white/10'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('YESTERDAY')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
                dateFilter.mode === 'YESTERDAY'
                  ? 'bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 text-slate-950 font-black shadow-md shadow-emerald-950/40 scale-105'
                  : 'bg-white/10 text-teal-100 hover:bg-white/20 border border-white/10'
              }`}
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('LAST_7')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
                dateFilter.mode === 'LAST_7'
                  ? 'bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 text-slate-950 font-black shadow-md shadow-emerald-950/40 scale-105'
                  : 'bg-white/10 text-teal-100 hover:bg-white/20 border border-white/10'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('THIS_MONTH')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 ${
                dateFilter.mode === 'THIS_MONTH'
                  ? 'bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 text-slate-950 font-black shadow-md shadow-emerald-950/40 scale-105'
                  : 'bg-white/10 text-teal-100 hover:bg-white/20 border border-white/10'
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('CUSTOM')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                dateFilter.mode === 'CUSTOM'
                  ? 'bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 text-amber-950 font-black shadow-md shadow-amber-950/30 scale-105'
                  : 'bg-white/10 text-teal-100 hover:bg-white/20 border border-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Pilih Rentang
            </button>
          </div>

          {/* Custom Date Range Selector (Dari - Sampai) */}
          {dateFilter.mode === 'CUSTOM' && (
            <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/80 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-200 font-semibold text-[11px]">Dari:</span>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    onChangeDateFilter({ ...dateFilter, startDate: e.target.value })
                  }
                  className="bg-white text-slate-900 font-bold px-2 py-1 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-emerald-200 font-semibold text-[11px]">Sampai:</span>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) =>
                    onChangeDateFilter({ ...dateFilter, endDate: e.target.value })
                  }
                  className="bg-white text-slate-900 font-bold px-2 py-1 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Label Periode Terpilih & Jam Realtime Digital */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-100 min-w-0">
              <span className="text-[11px] font-semibold text-teal-200/90 shrink-0">Periode:</span>
              <strong className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/15 backdrop-blur-sm truncate text-[11px] sm:text-xs">
                {formatDateRangeLabel(dateFilter.startDate, dateFilter.endDate)}
              </strong>
            </div>

            {realtimeClock && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/40 border border-teal-400/30 text-teal-200 font-mono text-[11.5px] font-bold shadow-inner backdrop-blur-md shrink-0">
                <Clock className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>{realtimeClock}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
