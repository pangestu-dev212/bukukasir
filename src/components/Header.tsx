'use client';

import React from 'react';
import { Store, Calendar, Share2, Download, BookOpen, Settings } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { formatDateIndo, getTodayDateString, getYesterdayDateString } from '@/lib/formatters';

interface HeaderProps {
  profile: UserProfile;
  selectedDate: string;
  todayDate?: string;
  yesterdayDate?: string;
  onSelectDate: (date: string) => void;
  onOpenProfile: () => void;
  onOpenWhatsApp: () => void;
  onExportExcel: () => void;
  onOpenDebts: () => void;
  debtCount: number;
}

export function Header({
  profile,
  selectedDate,
  todayDate = '',
  yesterdayDate = '',
  onSelectDate,
  onOpenProfile,
  onOpenWhatsApp,
  onExportExcel,
  onOpenDebts,
  debtCount,
}: HeaderProps) {
  const today = todayDate;
  const yesterday = yesterdayDate;

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Baris Atas: Info Toko & Tombol Menu Cepat */}
        <div className="flex items-center justify-between gap-2 border-b border-emerald-700/60 pb-2.5">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 text-left hover:bg-emerald-700/50 p-1.5 -ml-1.5 rounded-xl transition"
            title="Klik untuk ubah nama toko"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/80 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Store className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white drop-shadow-sm">
                  {profile.storeName || 'Buku Kasir Toko'}
                </h1>
                <Settings className="w-3.5 h-3.5 text-emerald-300 opacity-80" />
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                {profile.ownerName ? `Pemilik: ${profile.ownerName}` : 'Catatan Keuangan UMKM'}
              </p>
            </div>
          </button>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenDebts}
              className="relative p-2 bg-emerald-700/60 hover:bg-emerald-700 rounded-xl text-emerald-100 transition border border-emerald-600/50 flex items-center gap-1 text-xs font-semibold"
              title="Buku Utang / Kasbon"
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
              title="Unduh Laporan Excel"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Baris Bawah: Pemilih Tanggal (Backdate Mudah untuk Lansia / Orang Tua) */}
        <div className="pt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectDate(today)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDate === today
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(yesterday)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDate === yesterday
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-700/50'
              }`}
            >
              Kemarin
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-emerald-900/50 px-2.5 py-1.5 rounded-lg border border-emerald-700/50">
            <Calendar className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Tanggal Terpilih Teks Panjang */}
        <div className="text-[11px] text-emerald-200/80 font-medium text-center mt-1.5">
          Menampilkan catatan: <strong className="text-white font-bold">{formatDateIndo(selectedDate)}</strong>
        </div>
      </div>
    </header>
  );
}
