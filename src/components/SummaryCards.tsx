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
    <div className="space-y-3">
      {/* Kartu Saldo Utama */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Sisa Kas / Uang di Tangan
            </span>
            <span className="text-[11px] bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 text-emerald-300 font-semibold max-w-[180px] truncate">
              {periodLabel}
            </span>
          </div>

          <div className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {formatRupiah(sisaKas)}
          </div>

          {/* Laba Bersih Toko Murni */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              Laba Bersih Toko (Omset Toko - Biaya Toko):
            </span>
            <span className={`font-bold ${untungBersihToko >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatRupiah(untungBersihToko)}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Kolom Pemasukan vs Pengeluaran Total */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Uang Masuk */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-emerald-800 text-xs font-bold">
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              Uang Masuk
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-900 tracking-tight">
            {formatRupiah(totalIn)}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 text-[10px] text-emerald-800 flex justify-between">
            <span>Toko: <strong>{formatRupiah(totalInBusiness)}</strong></span>
            {totalInPersonal > 0 && (
              <span>Pribadi: <strong>{formatRupiah(totalInPersonal)}</strong></span>
            )}
          </div>
        </div>

        {/* Total Uang Keluar */}
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-rose-800 text-xs font-bold">
              <div className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              Uang Keluar
            </span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-rose-900 tracking-tight">
            {formatRupiah(totalOut)}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 text-[10px] text-rose-800 flex justify-between">
            <span>Toko: <strong>{formatRupiah(totalOutBusiness)}</strong></span>
            <span>Dapur: <strong>{formatRupiah(totalOutPersonal)}</strong></span>
          </div>
        </div>
      </div>

      {/* Rincian Pemisahan: Toko vs Pribadi */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs">
        <div className="flex items-center justify-between text-amber-950 font-bold mb-2">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Pemisahan Kas Toko vs Pribadi:
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">Cegah Tercampur</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/90 border border-blue-200/80 rounded-xl p-2">
            <div className="flex items-center justify-between text-blue-900 font-semibold text-[11px]">
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                🏪 Arus Kas Usaha
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Omset:</span>
                <span className="font-bold text-emerald-700">+{formatRupiah(totalInBusiness)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya:</span>
                <span className="font-bold text-rose-700">-{formatRupiah(totalOutBusiness)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 border border-purple-200/80 rounded-xl p-2">
            <div className="flex items-center justify-between text-purple-900 font-semibold text-[11px]">
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-purple-600" />
                🏠 Arus Kas Pribadi
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Masuk:</span>
                <span className="font-bold text-emerald-700">+{formatRupiah(totalInPersonal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dapur:</span>
                <span className="font-bold text-rose-700">-{formatRupiah(totalOutPersonal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => onFilterChange('ALL')}
          className={`flex-1 py-1.5 rounded-lg transition text-center ${
            scopeFilter === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Catatan
        </button>
        <button
          onClick={() => onFilterChange('BUSINESS')}
          className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            scopeFilter === 'BUSINESS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-blue-700'
          }`}
        >
          <Store className="w-3 h-3" />
          Usaha Toko
        </button>
        <button
          onClick={() => onFilterChange('PERSONAL')}
          className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            scopeFilter === 'PERSONAL'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-purple-700'
          }`}
        >
          <Home className="w-3 h-3" />
          Pribadi Dapur
        </button>
      </div>
    </div>
  );
}
