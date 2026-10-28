'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Trash2, Calendar, Store, Home } from 'lucide-react';
import { TransactionItem } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface TransactionListProps {
  items: TransactionItem[];
  selectedDate: string;
  onDeleteItem: (id: string) => void;
}

export function TransactionList({ items, selectedDate, onDeleteItem }: TransactionListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="font-bold text-slate-700 text-sm">Belum Ada Catatan Transaksi</h3>
        <p className="text-xs text-slate-500 mt-1">
          Klik tombol hijau <strong className="text-emerald-700">+ Uang Masuk</strong> atau tombol merah{' '}
          <strong className="text-rose-700">- Uang Keluar</strong> di bawah untuk mulai mencatat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>Riwayat Transaksi ({items.length})</span>
        <span>{formatDateIndo(selectedDate)}</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isIncome = item.type === 'IN';
          const isBusiness = item.scope === 'BUSINESS';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 border-l-4 ${
                isIncome
                  ? 'border-l-emerald-500 hover:border-l-teal-400'
                  : isBusiness
                  ? 'border-l-rose-500 hover:border-l-pink-400'
                  : 'border-l-purple-500 hover:border-l-pink-400'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Icon Kotak Gradasi */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    isIncome
                      ? 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200/80'
                      : isBusiness
                      ? 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 border border-rose-200/80'
                      : 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 border border-purple-200/80'
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>

                {/* Deskripsi */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 leading-tight">
                      {item.categoryName}
                    </span>

                    {/* Badge Scope (Toko vs Pribadi) */}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                        isBusiness
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {isBusiness ? <Store className="w-2.5 h-2.5" /> : <Home className="w-2.5 h-2.5" />}
                      {isBusiness ? 'Toko' : 'Pribadi'}
                    </span>

                    {item.paymentMethod !== 'TUNAI' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.paymentMethod}
                      </span>
                    )}
                  </div>

                  {item.note && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.note}</p>
                  )}
                </div>
              </div>

              {/* Nilai Nominal & Tombol Hapus */}
              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div
                    className={`font-extrabold text-base tracking-tight ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatRupiah(item.amount)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus catatan transaksi ini?')) {
                      onDeleteItem(item.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
