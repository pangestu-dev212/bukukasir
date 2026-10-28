'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Store, Home, AlertCircle, Sparkles } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface SummaryCardsProps {
  totalInBusiness: number;
  totalInPersonal: number;
  totalOutBusiness: number;
  totalOutPersonal: number;
  periodLabel: string;
  scopeFilter: 'ALL' | 'BUSINESS' | 'PERSONAL';
  onFilterChange: (scope: 'ALL' | 'BUSINESS' | 'PERSONAL') => void;
}

export function SummaryCards({
  totalInBusiness,
  totalInPersonal,
  totalOutBusiness,
  totalOutPersonal,
  periodLabel,
  scopeFilter,
  onFilterChange,
}: SummaryCardsProps) {
  const totalIn = totalInBusiness + totalInPersonal;
  const totalOut = totalOutBusiness + totalOutPersonal;
  const sisaKas = totalIn - totalOut;
  const untungBersihToko = totalInBusiness - totalOutBusiness;

  return (
    <div className="space-y-3.5">
      {/* Kartu Saldo Utama - Luxury Dark Teal Glass Gradient */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 shadow-xl shadow-slate-950/20 border border-teal-500/30 relative overflow-hidden">
        {/* Ambient background decorative glow */}
        <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-gradient-to-br from-emerald-400/25 via-teal-400/15 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-400/15 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-teal-200/90 font-semibold mb-1.5">
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-200 text-xs tracking-wide">Sisa Kas / Uang di Tangan</span>
            </span>
            <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full border border-white/15 text-teal-200 font-bold backdrop-blur-md max-w-[180px] truncate shadow-sm">
              {periodLabel}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-200 my-2.5 drop-shadow-sm">
            {formatRupiah(sisaKas)}
          </div>

          {/* Laba Bersih Toko Murni */}
          <div className="bg-gradient-to-r from-slate-900/90 to-teal-950/90 border border-teal-500/25 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs shadow-inner backdrop-blur-sm">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <Store className="w-3.5 h-3.5 text-cyan-400" />
              Laba Bersih Toko (Omset Toko - Biaya):
            </span>
            <span
              className={`font-black text-sm ${
                untungBersihToko >= 0
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm'
                  : 'text-rose-400'
              }`}
            >
              {formatRupiah(untungBersihToko)}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Kolom Pemasukan vs Pengeluaran Total Bergradasi */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Uang Masuk */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 border border-emerald-300/80 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-900 text-xs font-black">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              </div>
              Uang Masuk
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 tracking-tight">
            {formatRupiah(totalIn)}
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-200/80 text-[10px] text-emerald-800 flex justify-between font-medium">
            <span>Toko: <strong className="text-emerald-950 font-bold">{formatRupiah(totalInBusiness)}</strong></span>
            {totalInPersonal > 0 && (
              <span>Pribadi: <strong className="text-teal-950 font-bold">{formatRupiah(totalInPersonal)}</strong></span>
            )}
          </div>
        </div>

        {/* Total Uang Keluar */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50/70 to-orange-50/40 border border-rose-300/80 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-rose-900 text-xs font-black">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              Uang Keluar
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-900 via-pink-800 to-red-950 tracking-tight">
            {formatRupiah(totalOut)}
          </div>
          <div className="mt-2 pt-2 border-t border-rose-200/80 text-[10px] text-rose-800 flex justify-between font-medium">
            <span>Toko: <strong className="text-rose-950 font-bold">{formatRupiah(totalOutBusiness)}</strong></span>
            <span>Dapur: <strong className="text-pink-950 font-bold">{formatRupiah(totalOutPersonal)}</strong></span>
          </div>
        </div>
      </div>

      {/* Rincian Pemisahan: Toko vs Pribadi */}
      <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/40 border border-amber-200/90 rounded-2xl p-3.5 text-xs shadow-sm">
        <div className="flex items-center justify-between text-amber-950 font-black mb-2.5">
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-700">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            Pemisahan Kas Toko vs Pribadi:
          </span>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
            Cegah Tercampur
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/60 border border-blue-200/90 rounded-xl p-2.5 shadow-sm">
            <div className="flex items-center justify-between text-blue-900 font-bold text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                Arus Kas Usaha
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Omset:</span>
                <span className="font-extrabold text-emerald-700">+{formatRupiah(totalInBusiness)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Biaya:</span>
                <span className="font-extrabold text-rose-700">-{formatRupiah(totalOutBusiness)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/90 via-fuchsia-50/70 to-pink-50/60 border border-purple-200/90 rounded-xl p-2.5 shadow-sm">
            <div className="flex items-center justify-between text-purple-900 font-bold text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-purple-600" />
                Arus Kas Pribadi
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Masuk:</span>
                <span className="font-extrabold text-emerald-700">+{formatRupiah(totalInPersonal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Dapur:</span>
                <span className="font-extrabold text-rose-700">-{formatRupiah(totalOutPersonal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs dengan Gradasi Modern */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/80 text-xs font-bold shadow-inner backdrop-blur-sm gap-1">
        <button
          onClick={() => onFilterChange('ALL')}
          className={`flex-1 py-2 rounded-xl transition text-center ${
            scopeFilter === 'ALL'
              ? 'bg-gradient-to-r from-white to-slate-50 text-slate-900 shadow-md border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          Semua Catatan
        </button>
        <button
          onClick={() => onFilterChange('BUSINESS')}
          className={`flex-1 py-2 rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
            scopeFilter === 'BUSINESS'
              ? 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 font-black'
              : 'text-slate-600 hover:text-blue-700 font-semibold'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Usaha Toko
        </button>
        <button
          onClick={() => onFilterChange('PERSONAL')}
          className={`flex-1 py-2 rounded-xl transition text-center flex items-center justify-center gap-1.5 ${
            scopeFilter === 'PERSONAL'
              ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-md shadow-purple-500/30 font-black'
              : 'text-slate-600 hover:text-purple-700 font-semibold'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Pribadi Dapur
        </button>
      </div>
    </div>
  );
}
