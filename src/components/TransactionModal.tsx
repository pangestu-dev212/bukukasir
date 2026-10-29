'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Store, Home, Calendar, Wallet, Plus, Sparkles } from 'lucide-react';
import { TransactionType, TransactionScope, CategoryItem } from '@/lib/types';
import { formatRupiah, formatDateIndo, getTodayDateString, getYesterdayDateString } from '@/lib/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  type: TransactionType;
  categories: CategoryItem[];
  selectedDate: string;
  onClose: () => void;
  onAddCategory?: (data: { name: string; type: TransactionType; scope: TransactionScope }) => void;
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
  onAddCategory,
  onSave,
}: TransactionModalProps) {
  const [scope, setScope] = useState<TransactionScope>('BUSINESS');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(selectedDate);
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'TRANSFER' | 'QRIS'>('TUNAI');

  // State tambah kategori baru manual
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setNote('');
      setDate(getTodayDateString());
      setPaymentMethod('TUNAI');
      setIsAddingCategory(false);
      setNewCatName('');

      if (type === 'IN') {
        setScope('BUSINESS');
        setCategoryName('Penjualan / Kasir');
      } else {
        setScope('BUSINESS');
        setCategoryName('Kulakan / Belanja Stok');
      }
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const numericAmount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
  const isIncome = type === 'IN';

  // Filter Kategori sesuai tipe & scope
  const availableCategories = categories.filter((c) => c.type === type && c.scope === scope);

  const handleScopeChange = (newScope: TransactionScope) => {
    setScope(newScope);
    // Cari kategori bawaan pertama yang cocok dengan scope baru
    const matching = categories.filter((c) => c.type === type && c.scope === newScope);
    if (matching.length > 0) {
      setCategoryName(matching[0].name);
    }
  };

  const handleQuickAdd = (add: number) => {
    const cur = numericAmount + add;
    setAmountStr(cur.toString());
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('Nama kategori tidak boleh kosong');
      return;
    }

    if (onAddCategory) {
      onAddCategory({
        name: newCatName.trim(),
        type,
        scope,
      });
    }

    setCategoryName(newCatName.trim());
    setNewCatName('');
    setIsAddingCategory(false);
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
      scope,
      amount: numericAmount,
      categoryName,
      note,
      date,
      paymentMethod,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header Modal - Luxury Gradient Theme */}
        <div
          className={`px-5 py-4 flex items-center justify-between text-white relative overflow-hidden shadow-md ${
            isIncome
              ? 'bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 border-b border-teal-500/30'
              : 'bg-gradient-to-r from-rose-800 via-rose-900 to-pink-950 border-b border-rose-500/30'
          }`}
        >
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-xl font-extrabold tracking-tight drop-shadow-xs">
              {isIncome ? 'Catat Uang Masuk' : 'Catat Uang Keluar'}
            </h2>
            <p className="text-xs text-teal-100/90 font-medium">
              {isIncome
                ? 'Pemasukan usaha (toko) atau pribadi (gaji/suntikan modal)'
                : 'Kulakan, operasional toko, atau kebutuhan pribadi/rumah'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* PEMISAHAN TRANSAKSI: USAHA/TOKO VS PRIBADI */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isIncome ? 'Pemasukan ini dari mana?' : 'Pengeluaran ini untuk apa?'}
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                {scope === 'BUSINESS' ? 'Masuk Kas Toko' : 'Pribadi / Dapur'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleScopeChange('BUSINESS')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border-2 ${
                  scope === 'BUSINESS'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-600 shadow-md shadow-teal-700/25'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                }`}
              >
                <Store className="w-4 h-4" />
                🏪 Usaha / Toko
              </button>

              <button
                type="button"
                onClick={() => handleScopeChange('PERSONAL')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border-2 ${
                  scope === 'PERSONAL'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-md shadow-purple-700/25'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                }`}
              >
                <Home className="w-4 h-4" />
                {isIncome ? '🏠 Pribadi / Modal Luar' : '🏠 Pribadi / Rumah'}
              </button>
            </div>
          </div>

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

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(2000)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +2 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(5000)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +5 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(10000)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +10 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(20000)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +20 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(50000)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                +50 Ribu
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100000)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
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

          {/* PILIH KATEGORI & TAMBAH MANUAL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Pilih Kategori ({scope === 'BUSINESS' ? 'Toko' : 'Pribadi'})
              </label>

              {!isAddingCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Tambah Kategori
                </button>
              )}
            </div>

            {/* Form Tambah Kategori Baru Manual */}
            {isAddingCategory && (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2.5 mb-2.5 space-y-2 animate-in fade-in duration-150">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Tambah Kategori {isIncome ? 'Pemasukan' : 'Pengeluaran'} Baru:
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gaji Kantor, Arisan, Titipan, dll"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomCategory}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shrink-0"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCatName('');
                    }}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium shrink-0"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Chips Kategori */}
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {availableCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryName(c.name)}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl text-left flex items-center justify-between border-2 transition ${
                    categoryName === c.name
                      ? isIncome
                        ? scope === 'BUSINESS'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                          : 'bg-purple-50 border-purple-600 text-purple-900 font-bold'
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
              placeholder="Contoh: Beli beras 10kg, Pembeli Pak RT, Gaji bulanan, dll"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* TANGGAL TRANSAKSI & METODE BAYAR */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Tanggal
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDate(getTodayDateString())}
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded transition ${
                      date === getTodayDateString()
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(getYesterdayDateString())}
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded transition ${
                      date === getYesterdayDateString()
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Kemarin
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[10px] text-teal-800 font-semibold mt-1 block truncate">
                🗓️ {formatDateIndo(date)}
              </span>
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
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-700/25'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 shadow-rose-700/25'
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
