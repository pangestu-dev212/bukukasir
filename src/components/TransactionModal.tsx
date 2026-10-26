'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Store, Home, Calendar, Wallet } from 'lucide-react';
import { TransactionType, TransactionScope, CategoryItem } from '@/lib/types';
import { formatRupiah } from '@/lib/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  type: TransactionType;
  categories: CategoryItem[];
  selectedDate: string;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    scope: TransactionScope;
    amount: number;
    categoryName: string;
    note: string;
    date: string;
    paymentMethod: 'TUNAI' | 'TRANSFER' | 'QRIS';
  }) => void;
}

export function TransactionModal({
  isOpen,
  type,
  categories,
  selectedDate,
  onClose,
  onSave,
}: TransactionModalProps) {
  const [scope, setScope] = useState<TransactionScope>('BUSINESS');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(selectedDate);
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'TRANSFER' | 'QRIS'>('TUNAI');

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setNote('');
      setDate(selectedDate);
      setPaymentMethod('TUNAI');

      if (type === 'IN') {
        setScope('BUSINESS');
        setCategoryName('Penjualan / Kasir');
      } else {
        setScope('BUSINESS');
        setCategoryName('Kulakan / Belanja Stok');
      }
    }
  }, [isOpen, type, selectedDate]);

  if (!isOpen) return null;

  const numericAmount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);

  // Filter Kategori sesuai tipe & scope
  const availableCategories = categories.filter((c) => {
    if (c.type !== type) return false;
    if (type === 'IN') return true;
    return c.scope === scope;
  });

  const handleQuickAdd = (add: number) => {
    const cur = numericAmount + add;
    setAmountStr(cur.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      alert('Mohon masukkan nominal uang di atas Rp 0');
      return;
    }
    if (!categoryName) {
      alert('Mohon pilih salah satu kategori');
      return;
    }

    onSave({
      type,
      scope: type === 'IN' ? 'BUSINESS' : scope,
      amount: numericAmount,
      categoryName,
      note,
      date,
      paymentMethod,
    });
    onClose();
  };

  const isIncome = type === 'IN';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header Modal */}
        <div
          className={`px-5 py-4 flex items-center justify-between text-white ${
            isIncome ? 'bg-emerald-700' : 'bg-rose-700'
          }`}
        >
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {isIncome ? 'Catat Uang Masuk' : 'Catat Uang Keluar'}
            </h2>
            <p className="text-xs text-white/80 font-medium">
              {isIncome ? 'Penjualan, jasa, atau modal' : 'Kulakan, operasional, atau pribadi'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* PEMISAHAN PENGELUARAN: TOKO VS PRIBADI (Jika Uang Keluar) */}
          {!isIncome && (
            <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pengeluaran ini untuk apa? <span className="text-rose-600 font-bold">*Wajib Pisah</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScope('BUSINESS');
                    setCategoryName('Kulakan / Belanja Stok');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border-2 ${
                    scope === 'BUSINESS'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  🏪 Usaha / Toko
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScope('PERSONAL');
                    setCategoryName('Belanja Dapur & Makan');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border-2 ${
                    scope === 'PERSONAL'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  🏠 Pribadi / Rumah
                </button>
              </div>
            </div>
          )}

          {/* INPUT NOMINAL BESAR & JELAS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Uang (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="0"
                value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setAmountStr(clean);
                }}
                className="w-full pl-14 pr-4 py-3 text-3xl font-extrabold text-slate-900 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            {/* Quick Add Buttons (Mudah ditekan jari orang tua) */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(10000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +10 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(20000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +20 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(50000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +50 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100000)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +100 Ribu
              </button>
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold ml-auto"
              >
                Reset
              </button>
            </div>
          </div>

          {/* PILIH KATEGORI (CHIPS BESAR) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Kategori
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {availableCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryName(c.name)}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl text-left flex items-center justify-between border-2 transition ${
                    categoryName === c.name
                      ? isIncome
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : scope === 'BUSINESS'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-purple-50 border-purple-600 text-purple-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {categoryName === c.name && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* KETERANGAN / CATATAN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan / Catatan Tambahan (Boleh Kosong)
            </label>
            <input
              type="text"
              placeholder="Contoh: Beli beras 10kg, Pembeli Pak RT, dll"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* TANGGAL TRANSAKSI (BACKDATE CEPAT) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Tanggal Catatan
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                Metode Bayar
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
              >
                <option value="TUNAI">💵 Tunai (Cash)</option>
                <option value="TRANSFER">🏦 Transfer Bank</option>
                <option value="QRIS">📱 QRIS / E-Wallet</option>
              </select>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-base text-white shadow-lg transition active:scale-[0.98] cursor-pointer ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
              }`}
            >
              Simpan Catatan ({formatRupiah(numericAmount)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
