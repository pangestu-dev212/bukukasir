'use client';

import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Store,
  Home,
  Search,
  Receipt,
  Sparkles,
  Filter,
  X,
  PlusCircle,
  MinusCircle,
  Lightbulb,
} from 'lucide-react';
import { TransactionItem } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface TransactionListProps {
  items: TransactionItem[];
  selectedDate: string;
  onDeleteItem: (id: string) => void;
  onSelectReceipt?: (item: TransactionItem) => void;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
}

export function TransactionList({
  items,
  selectedDate,
  onDeleteItem,
  onSelectReceipt,
  onAddIncome,
  onAddExpense,
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  // Filter transaksi berdasarkan pencarian dan tipe
  const filteredItems = items.filter((item) => {
    // Filter tipe
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

    // Filter teks pencarian
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchCategory = item.categoryName.toLowerCase().includes(q);
    const matchNote = item.note?.toLowerCase().includes(q);
    const matchAmount = item.amount.toString().includes(q);
    const matchMethod = item.paymentMethod.toLowerCase().includes(q);

    return matchCategory || matchNote || matchAmount || matchMethod;
  });

  // Empty state edukatif jika dari awal memang belum ada transaksi pada periode terpilih
  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-white via-slate-50 to-emerald-50/20 rounded-3xl border border-slate-200/90 p-6 sm:p-8 text-center shadow-xs space-y-4">
        {/* Ikon Cantik dengan Ambient Glow */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 text-teal-700 mx-auto flex items-center justify-center shadow-inner border border-emerald-200/60">
          <Calendar className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div>
          <h3 className="font-extrabold text-slate-800 text-base">
            Pembukuan Masih Bersih
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Belum ada catatan transaksi pada periode <strong className="text-slate-700">{formatDateIndo(selectedDate)}</strong>.
          </p>
        </div>

        {/* Tips Edukasi Kasir UMKM */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-left text-xs max-w-md mx-auto shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div className="text-amber-950">
              <strong className="font-bold text-[11.5px] block">Tips Kasir Anti-Bocor:</strong>
              <span className="text-[11px] text-amber-900 leading-relaxed">
                Mencatat pengeluaran kecil seperti es teh, bensin, atau parkir Rp 2.000 - Rp 10.000 mencegah selisih kas misterius hingga puluhan persen di akhir bulan!
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Cepat */}
        <div className="flex items-center justify-center gap-2.5 pt-1">
          {onAddIncome && (
            <button
              type="button"
              onClick={onAddIncome}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-emerald-700/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Catat Penjualan
            </button>
          )}

          {onAddExpense && (
            <button
              type="button"
              onClick={onAddExpense}
              className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <MinusCircle className="w-3.5 h-3.5" />
              - Catat Biaya
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bar Pencarian & Filter Cepat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari transaksi (nama barang, catatan, nominal)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filter Tipe Transaksi */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                typeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Semua ({items.length})
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('IN')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                typeFilter === 'IN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
              Masuk
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('OUT')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                typeFilter === 'OUT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100/80'
              }`}
            >
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              Keluar
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {formatDateIndo(selectedDate)}
          </span>
        </div>
      </div>

      {/* Jika hasil pencarian nihil */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 shadow-xs">
          <p className="text-xs font-bold text-slate-700">Tidak ada transaksi yang cocok</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Coba gunakan kata kunci pencarian lain atau ubah filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
            }}
            className="mt-2.5 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        /* Daftar Item Transaksi */
        <div className="space-y-2">
          {filteredItems.map((item) => {
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

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 mt-0.5">
                      <span className="text-slate-500 font-medium">{formatDateIndo(item.date)}</span>
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[180px] sm:max-w-xs">{item.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nilai Nominal & Tombol Aksi (Cetak Struk + Hapus) */}
                <div className="text-right shrink-0 flex items-center gap-1.5">
                  <div className="mr-1">
                    <div
                      className={`font-extrabold text-sm sm:text-base tracking-tight ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(item.amount)}
                    </div>
                  </div>

                  {/* Tombol Cetak Struk */}
                  {onSelectReceipt && (
                    <button
                      type="button"
                      onClick={() => onSelectReceipt(item)}
                      className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                      title="Cetak Struk / Nota Digital"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  )}

                  {/* Tombol Hapus */}
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
      )}
    </div>
  );
}
