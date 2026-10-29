'use client';

import React, { useState } from 'react';
import { X, Plus, BookOpen, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { DebtItem, DebtType } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { generateDebtReminderWhatsApp } from '@/lib/whatsapp';

interface DebtBookModalProps {
  isOpen: boolean;
  storeName: string;
  debts: DebtItem[];
  onClose: () => void;
  onSaveDebt: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'status' | 'paidAmount'>) => void;
  onPayDebt: (id: string, amount: number) => void;
  onDeleteDebt: (id: string) => void;
}

export function DebtBookModal({
  isOpen,
  storeName,
  debts,
  onClose,
  onSaveDebt,
  onPayDebt,
  onDeleteDebt,
}: DebtBookModalProps) {
  const [activeTab, setActiveTab] = useState<DebtType>('RECEIVABLE');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [personName, setPersonName] = useState<string>('');
  const [personPhone, setPersonPhone] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const filteredDebts = debts.filter((d) => d.type === activeTab);
  const totalUnpaid = filteredDebts
    .filter((d) => d.status !== 'LUNAS')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
    if (!personName.trim()) {
      alert('Nama orang / suplier wajib diisi');
      return;
    }
    if (amount <= 0) {
      alert('Nominal harus lebih dari 0');
      return;
    }

    onSaveDebt({
      personName: personName.trim(),
      personPhone: personPhone.trim() || undefined,
      type: activeTab,
      amount,
      note: note.trim() || undefined,
    });

    setPersonName('');
    setPersonPhone('');
    setAmountStr('');
    setNote('');
    setIsAdding(false);
  };

  const handleSendReminderWA = (debt: DebtItem) => {
    const sisa = debt.amount - (debt.paidAmount || 0);
    const msg = generateDebtReminderWhatsApp(storeName, debt.personName, sisa, debt.note);
    let url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (debt.personPhone) {
      let cleanPhone = debt.personPhone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Luxury Warm Gradient */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 px-5 py-4 text-white flex items-center justify-between relative overflow-hidden shadow-md">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-200 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight tracking-tight">Buku Utang & Kasbon</h2>
              <p className="text-xs text-amber-100/90 font-medium">Catatan piutang pelanggan dan utang toko</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition relative z-10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-amber-50/70 border-b border-amber-200/80 flex gap-2">
          <button
            onClick={() => {
              setActiveTab('RECEIVABLE');
              setIsAdding(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'RECEIVABLE'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-700/25'
                : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-slate-200'
            }`}
          >
            👥 Pelanggan Kasbon (Piutang)
          </button>
          <button
            onClick={() => {
              setActiveTab('PAYABLE');
              setIsAdding(false);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'PAYABLE'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-amber-700/25'
                : 'bg-white text-slate-700 hover:bg-amber-100/60 border border-slate-200'
            }`}
          >
            🏢 Utang Kita ke Suplier
          </button>
        </div>

        {/* Total Belum Lunas Banner */}
        <div className="px-5 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">
            {activeTab === 'RECEIVABLE' ? 'Total Uang Belum Diterima:' : 'Total Utang yang Harus Dibayar:'}
          </span>
          <span className="text-amber-400 text-sm font-extrabold">{formatRupiah(totalUnpaid)}</span>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 border-2 border-dashed border-amber-400 text-amber-800 font-bold text-xs rounded-2xl bg-amber-50/50 hover:bg-amber-100/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'RECEIVABLE' ? '+ Catat Kasbon Pelanggan Baru' : '+ Catat Utang Suplier Baru'}
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span>Form Catat {activeTab === 'RECEIVABLE' ? 'Kasbon' : 'Utang'}</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama {activeTab === 'RECEIVABLE' ? 'Pelanggan' : 'Suplier / Toko'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bu RT Siti / Toko Sembako Makmur"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="0"
                    value={amountStr ? parseInt(amountStr.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp (Opsional)</label>
                  <input
                    type="tel"
                    placeholder="0812xxxx"
                    value={personPhone}
                    onChange={(e) => setPersonPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Keterangan Barang / Keperluan</label>
                <input
                  type="text"
                  placeholder="Contoh: Beras 5kg, Telur 1kg, atau Kulakan Rokok"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Simpan Catatan
              </button>
            </form>
          )}

          {/* List Debts */}
          {filteredDebts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Belum ada catatan {activeTab === 'RECEIVABLE' ? 'kasbon pelanggan' : 'utang suplier'}.
            </p>
          ) : (
            filteredDebts.map((d) => {
              const sisa = d.amount - (d.paidAmount || 0);
              const isLunas = d.status === 'LUNAS' || sisa <= 0;

              return (
                <div
                  key={d.id}
                  className={`rounded-2xl border p-3.5 transition flex items-center justify-between gap-3 ${
                    isLunas ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-amber-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{d.personName}</h4>
                      {isLunas ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Lunas
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                          Belum Lunas
                        </span>
                      )}
                    </div>
                    {d.note && <p className="text-xs text-slate-500 mt-0.5">{d.note}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Total: {formatRupiah(d.amount)}
                      {d.paidAmount > 0 && ` (Sudah dicicil: ${formatRupiah(d.paidAmount)})`}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1.5">
                    <div className="font-extrabold text-sm text-amber-900">{formatRupiah(sisa)}</div>

                    {!isLunas && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendReminderWA(d)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          title="Kirim Pengingat Sopan via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WA</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Tandai kasbon ${d.personName} sebesar ${formatRupiah(sisa)} sudah lunas?`)) {
                              onPayDebt(d.id, sisa);
                            }
                          }}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold"
                        >
                          Lunas
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
