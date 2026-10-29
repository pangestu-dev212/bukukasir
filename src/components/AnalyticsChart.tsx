'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, ChevronDown, ChevronUp, Sparkles, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { TransactionItem } from '@/lib/types';
import { formatRupiah, formatDateShortIndo } from '@/lib/formatters';

interface AnalyticsChartProps {
  transactions: TransactionItem[];
}

export function AnalyticsChart({ transactions }: AnalyticsChartProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Buat data 7 hari terakhir
  const days: { dateStr: string; label: string; income: number; expense: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Label hari (Sen, Sel, Rab, Kam, Jum, Sab, Min)
    const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
    
    days.push({
      dateStr,
      label,
      income: 0,
      expense: 0,
    });
  }

  // Akumulasikan transaksi
  transactions.forEach((t) => {
    const dayObj = days.find((d) => d.dateStr === t.date);
    if (dayObj) {
      if (t.type === 'IN') {
        dayObj.income += t.amount;
      } else {
        dayObj.expense += t.amount;
      }
    }
  });

  // Cari nilai maksimum untuk normalisasi tinggi bar
  const maxVal = Math.max(...days.map((d) => Math.max(d.income, d.expense)), 100000);

  // Hitung total 7 hari
  const totalIncome7Days = days.reduce((sum, d) => sum + d.income, 0);
  const totalExpense7Days = days.reduce((sum, d) => sum + d.expense, 0);
  const net7Days = totalIncome7Days - totalExpense7Days;

  // Cari hari dengan penjualan tertinggi
  const bestDay = [...days].sort((a, b) => b.income - a.income)[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Header Bar Grafik */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-slate-50 via-teal-50/30 to-emerald-50/40 hover:bg-slate-100/80 transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
              Grafik Tren Usaha 7 Hari
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Perbandingan Omset Penjualan vs Pengeluaran</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            Net: <span className={net7Days >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatRupiah(net7Days)}</span>
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Konten Grafik Terbuka */}
      {isOpen && (
        <div className="p-4 pt-2 border-t border-slate-100 space-y-4">
          {/* Ringkasan Cepat 7 Hari */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-emerald-700 block">Omset 7 Hari</span>
              <span className="font-extrabold text-xs sm:text-sm text-emerald-800 truncate block">
                {formatRupiah(totalIncome7Days)}
              </span>
            </div>

            <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-rose-700 block">Biaya 7 Hari</span>
              <span className="font-extrabold text-xs sm:text-sm text-rose-800 truncate block">
                {formatRupiah(totalExpense7Days)}
              </span>
            </div>

            <div className="bg-cyan-50/70 border border-cyan-100 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-cyan-800 block">Puncak Omset</span>
              <span className="font-bold text-[11px] text-cyan-900 truncate block">
                {bestDay.income > 0 ? `${bestDay.label} (${formatRupiah(bestDay.income)})` : '-'}
              </span>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="pt-2">
            <div className="h-36 flex items-end justify-between gap-2 sm:gap-3 px-1 border-b border-slate-200 pb-2">
              {days.map((d, idx) => {
                const incomePercent = Math.min(100, Math.max(8, (d.income / maxVal) * 100));
                const expensePercent = Math.min(100, Math.max(8, (d.expense / maxVal) * 100));
                const isToday = idx === days.length - 1;

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[9.5px] py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                      <span>Masuk: {formatRupiah(d.income)}</span>
                      <span>Keluar: {formatRupiah(d.expense)}</span>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-0.5"></div>
                    </div>

                    {/* Bar Pasangan (Omset & Biaya) */}
                    <div className="w-full flex items-end justify-center gap-1 h-28">
                      {/* Bar Masuk */}
                      <div
                        style={{ height: d.income > 0 ? `${incomePercent}%` : '4px' }}
                        className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                          d.income > 0
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-xs'
                            : 'bg-slate-200'
                        }`}
                        title={`Masuk: ${formatRupiah(d.income)}`}
                      />

                      {/* Bar Keluar */}
                      <div
                        style={{ height: d.expense > 0 ? `${expensePercent}%` : '4px' }}
                        className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                          d.expense > 0
                            ? 'bg-gradient-to-t from-rose-500 to-pink-400 shadow-xs'
                            : 'bg-slate-200'
                        }`}
                        title={`Keluar: ${formatRupiah(d.expense)}`}
                      />
                    </div>

                    {/* Label Hari */}
                    <span
                      className={`text-[10px] mt-2 font-bold ${
                        isToday ? 'text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-md' : 'text-slate-500'
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legenda Warna */}
            <div className="flex items-center justify-center gap-4 pt-2.5 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Uang Masuk (Omset)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Uang Keluar (Biaya)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
