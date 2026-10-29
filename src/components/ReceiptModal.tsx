'use client';

import React, { useRef } from 'react';
import { X, Printer, Share2, Check, Store, Calendar, Clock, CreditCard } from 'lucide-react';
import { TransactionItem, StoreProfile } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';

interface ReceiptModalProps {
  isOpen: boolean;
  store: StoreProfile;
  transaction: TransactionItem | null;
  onClose: () => void;
}

export function ReceiptModal({ isOpen, store, transaction, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const getReceiptNumber = (tx: TransactionItem): string => {
    const cleanDate = (tx.date || '').replace(/-/g, '').slice(2);
    if (tx.id.startsWith('sample-')) {
      const num = tx.id.replace('sample-', '').padStart(3, '0');
      return `TRX-${cleanDate}-${num}`;
    }
    const cleanId = tx.id.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
    return `TRX-${cleanDate}-${cleanId}`;
  };

  const receiptNo = getReceiptNumber(transaction);

  const handleShareWhatsApp = () => {
    let msg = `*🧾 NOTA TRANSAKSI - ${store.storeName.toUpperCase()}*\n`;
    if (store.ownerName) msg += `Kasir: ${store.ownerName}\n`;
    msg += `📅 Tanggal: ${formatDateIndo(transaction.date)}\n`;
    msg += `No. Reff: ${receiptNo}\n`;
    msg += `--------------------------------\n`;
    msg += `Item/Kategori: *${transaction.categoryName}*\n`;
    if (transaction.note) msg += `Catatan: ${transaction.note}\n`;
    msg += `Metode Bayar: ${transaction.paymentMethod}\n`;
    msg += `--------------------------------\n`;
    msg += `*TOTAL: ${formatRupiah(transaction.amount)}*\n`;
    msg += `--------------------------------\n`;
    msg += `Terima kasih telah berbelanja di *${store.storeName}*! 🙏\n`;
    msg += `_Dicatat via BukuKasir Digital_`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const isIncome = transaction.type === 'IN';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm">Nota Struk Digital</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Area Struk Thermal (Printable) */}
        <div className="p-4 bg-slate-100 flex-1">
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs font-mono text-xs text-slate-800 space-y-3 relative"
          >
            {/* Header Toko */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              {store.logo && (
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                  <img src={store.logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                {store.storeName}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pemilik: {store.ownerName}
              </p>
              {store.phone && (
                <p className="text-[10px] text-slate-400">Telp/WA: {store.phone}</p>
              )}
            </div>

            {/* Info Transaksi */}
            <div className="space-y-1 text-[11px] text-slate-600 border-b border-dashed border-slate-300 pb-2.5">
              <div className="flex justify-between">
                <span>No. Reff:</span>
                <span className="font-bold text-slate-800">{receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-bold text-slate-800">{formatDateIndo(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span className={`font-bold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isIncome ? 'PENJUALAN (MASUK)' : 'PENGELUARAN (KELUAR)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="font-bold text-slate-800">{transaction.paymentMethod}</span>
              </div>
            </div>

            {/* Rincian Item */}
            <div className="py-1 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900 text-xs">
                <span>{transaction.categoryName}</span>
                <span>{formatRupiah(transaction.amount)}</span>
              </div>
              {transaction.note && (
                <p className="text-[11px] text-slate-500 italic pl-1 border-l-2 border-slate-200">
                  {transaction.note}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>TOTAL</span>
              <span className="text-base text-emerald-800">{formatRupiah(transaction.amount)}</span>
            </div>

            {/* Footer Struk */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-600">*** TERIMA KASIH ***</p>
              <p>Barang yang sudah dibeli tidak dapat ditukar</p>
              <p className="text-[9px] text-slate-400 pt-1">BukuKasir Digital UMKM</p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Struk
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            Kirim ke WA
          </button>
        </div>
      </div>
    </div>
  );
}
