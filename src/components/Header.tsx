'use client';

import React from 'react';
import { Store, Calendar, Share2, Download, BookOpen, ChevronDown, Pencil, LogOut, User, Cloud, RefreshCw } from 'lucide-react';
import { StoreProfile, DateFilter, DateFilterMode, UserAccount } from '@/lib/types';
import { formatDateRangeLabel } from '@/lib/formatters';

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
  const handlePresetClick = (mode: DateFilterMode) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (mode === 'TODAY') {
      onChangeDateFilter({ mode: 'TODAY', startDate: today, endDate: today });
    } else if (mode === 'YESTERDAY') {
      onChangeDateFilter({ mode: 'YESTERDAY', startDate: yesterday, endDate: yesterday });
    } else if (mode === 'LAST_7') {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      onChangeDateFilter({
        mode: 'LAST_7',
        startDate: start.toISOString().split('T')[0],
        endDate: today,
      });
    } else if (mode === 'THIS_MONTH') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      onChangeDateFilter({
        mode: 'THIS_MONTH',
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
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
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Baris Atas: Info Toko & Tombol Menu Cepat */}
        <div className="flex items-center justify-between gap-2 border-b border-emerald-700/60 pb-2.5">
          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={onOpenStoreSwitcher}
              className="flex items-center gap-2 text-left hover:bg-emerald-700/50 p-1.5 -ml-1 rounded-xl transition group min-w-0"
              title="Klik untuk ganti atau tambah buku toko"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/80 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <Store className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-white drop-shadow-sm truncate max-w-[130px] sm:max-w-[210px]">
                    {activeStore.storeName || 'Buku Kasir'}
                  </h1>
                  <ChevronDown className="w-4 h-4 text-emerald-300 group-hover:translate-y-0.5 transition shrink-0" />
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium truncate">
                  {activeStore.ownerName ? `Pemilik: ${activeStore.ownerName}` : 'Ganti Buku Usaha ▾'}
                </p>
              </div>
            </button>

            {/* Tombol Cepat Edit Nama Toko */}
            <button
              type="button"
              onClick={onEditActiveStore}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/70 rounded-lg transition shrink-0"
              title="Edit Nama Toko / Usaha Ini"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={onOpenDebts}
              className="relative p-2 bg-emerald-700/60 hover:bg-emerald-700 rounded-xl text-emerald-100 transition border border-emerald-600/50 flex items-center gap-1 text-xs font-semibold"
              title="Buku Utang & Kasbon"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Kasbon</span>
              {debtCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-800 animate-pulse">
                  {debtCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenWhatsApp}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition border border-emerald-500/50 flex items-center gap-1 text-xs font-semibold shadow-sm"
              title="Bagikan Rekap ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim WA</span>
            </button>

            <button
              onClick={onExportExcel}
              className="p-2 bg-emerald-700/60 hover:bg-emerald-700 rounded-xl text-emerald-100 transition border border-emerald-600/50"
              title="Unduh Laporan Excel Periode Ini"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Tombol Status Cloud Sync */}
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="p-2 bg-emerald-700/60 hover:bg-emerald-700 rounded-xl text-emerald-100 transition border border-emerald-600/50 flex items-center gap-1 text-xs"
              title={
                isSyncing
                  ? 'Sedang menyinkronkan data ke Cloud Supabase...'
                  : 'Data tersinkronisasi ke Cloud Supabase (Klik untuk Sinkronkan Sekarang)'
              }
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'text-amber-300 animate-pulse' : 'text-emerald-300'}`} />
              <span className="hidden sm:inline font-semibold text-[11px]">
                {isSyncing ? 'Sync...' : 'Cloud'}
              </span>
            </button>

            {/* User Account / Logout */}
            <button
              onClick={onLogout}
              className="p-2 bg-emerald-900/50 hover:bg-rose-600/90 rounded-xl text-emerald-200 hover:text-white transition border border-emerald-700/60 flex items-center gap-1 text-xs"
              title={`Akun aktif: ${currentUser?.username || 'admin'} - Klik untuk Keluar / Ganti Akun`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline font-semibold text-[11px] max-w-[80px] truncate">
                {currentUser?.username || 'Keluar'}
              </span>
            </button>
          </div>
        </div>

        {/* Baris Bawah: FILTER PERIODE TANGGAL (Hari Ini, Kemarin, 7 Hari, Bulan Ini, Rentang) */}
        <div className="pt-2.5 space-y-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button
              type="button"
              onClick={() => handlePresetClick('TODAY')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                dateFilter.mode === 'TODAY'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('YESTERDAY')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                dateFilter.mode === 'YESTERDAY'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
              }`}
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('LAST_7')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                dateFilter.mode === 'LAST_7'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('THIS_MONTH')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                dateFilter.mode === 'THIS_MONTH'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => handlePresetClick('CUSTOM')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1 ${
                dateFilter.mode === 'CUSTOM'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
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

          {/* Label Periode Terpilih */}
          <div className="text-[11px] text-emerald-200/90 font-medium text-center">
            Periode: <strong className="text-white font-bold">{formatDateRangeLabel(dateFilter.startDate, dateFilter.endDate)}</strong>
          </div>
        </div>
      </div>
    </header>
  );
}
