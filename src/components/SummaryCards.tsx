'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Store, Home, AlertCircle } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface SummaryCardsProps {
  totalIn: number;
  totalOutBusiness: number;
  totalOutPersonal: number;
  scopeFilter: 'ALL' | 'BUSINESS' | 'PERSONAL';
  onFilterChange: (scope: 'ALL' | 'BUSINESS' | 'PERSONAL') => void;
}

export function SummaryCards({
  totalIn,
  totalOutBusiness,
  totalOutPersonal,
  scopeFilter,
  onFilterChange,
}: SummaryCardsProps) {
  const totalOut = totalOutBusiness + totalOutPersonal;
  const sisaKas = totalIn - totalOut;
  const untungBersihToko = totalIn - totalOutBusiness;

  return (
    <div className="space-y-3">
      {/* Kartu Saldo Utama (Besar & Kontras Tinggi) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Sisa Uang di Kas / Dompet
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-emerald-300">
              Hari Ini
            </span>
          </div>

          <div className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {formatRupiah(sisaKas)}
          </div>

          {/* Catatan Untung Bersih Toko (Sebelum dipotong kebutuhan pribadi) */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              Laba Bersih Usaha:
            </span>
            <span className={`font-bold ${untungBersihToko >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatRupiah(untungBersihToko)}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Kolom Pemasukan vs Pengeluaran */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Pemasukan */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            Uang Masuk
          </div>
          <div className="text-xl font-extrabold text-emerald-900 tracking-tight">
            {formatRupiah(totalIn)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Dari penjualan & jasa</p>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold mb-1">
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            Uang Keluar
          </div>
          <div className="text-xl font-extrabold text-rose-900 tracking-tight">
            {formatRupiah(totalOut)}
          </div>
          <p className="text-[11px] text-rose-700 mt-0.5 font-medium">Toko + Pribadi</p>
        </div>
      </div>

      {/* Rincian Pemisahan: Pengeluaran Toko vs Pengeluaran Pribadi (PENTING AGAR TIDAK BOCOR HALUS) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs">
        <div className="flex items-center justify-between text-amber-950 font-bold mb-2">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Pemisahan Pengeluaran Kas:
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">Cegah Bocor Kasir</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/90 border border-blue-200/80 rounded-xl p-2">
            <div className="flex items-center gap-1 text-blue-900 font-semibold text-[11px]">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              🏪 Toko / Usaha
            </div>
            <div className="text-sm font-bold text-blue-950 mt-0.5">
              {formatRupiah(totalOutBusiness)}
            </div>
            <span className="text-[10px] text-blue-700">Kulakan, gaji, operasional</span>
          </div>

          <div className="bg-white/90 border border-purple-200/80 rounded-xl p-2">
            <div className="flex items-center gap-1 text-purple-900 font-semibold text-[11px]">
              <Home className="w-3.5 h-3.5 text-purple-600" />
              🏠 Pribadi / Dapur
            </div>
            <div className="text-sm font-bold text-purple-950 mt-0.5">
              {formatRupiah(totalOutPersonal)}
            </div>
            <span className="text-[10px] text-purple-700">Makan, jajan, anak</span>
          </div>
        </div>
      </div>

      {/* Tab Filter Tampilan Daftar Transaksi */}
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
          🏪 Usaha Toko
        </button>
        <button
          onClick={() => onFilterChange('PERSONAL')}
          className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            scopeFilter === 'PERSONAL'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-purple-700'
          }`}
        >
          🏠 Pribadi Dapur
        </button>
      </div>
    </div>
  );
}
