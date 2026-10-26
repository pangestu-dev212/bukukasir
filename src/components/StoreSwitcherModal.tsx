'use client';

import React, { useState } from 'react';
import { X, Plus, Store, Check, Trash2, Cloud, Sparkles, Smartphone } from 'lucide-react';
import { StoreProfile, BUSINESS_TYPES } from '@/lib/types';

interface StoreSwitcherModalProps {
  isOpen: boolean;
  stores: StoreProfile[];
  activeStoreId: string;
  onClose: () => void;
  onSelectStore: (id: string) => void;
  onCreateStore: (data: { storeName: string; ownerName?: string; businessType: string; phone?: string; pin?: string }) => void;
  onDeleteStore: (id: string) => void;
  onSyncCloud: (store: StoreProfile) => void;
}

export function StoreSwitcherModal({
  isOpen,
  stores,
  activeStoreId,
  onClose,
  onSelectStore,
  onCreateStore,
  onDeleteStore,
  onSyncCloud,
}: StoreSwitcherModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState('WARUNG');
  const [newPhone, setNewPhone] = useState('');
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      alert('Nama buku toko wajib diisi');
      return;
    }
    onCreateStore({
      storeName: newStoreName.trim(),
      ownerName: newOwnerName.trim() || undefined,
      businessType: newBusinessType,
      phone: newPhone.trim() || undefined,
      pin: newPin.trim() || undefined,
    });
    setNewStoreName('');
    setNewOwnerName('');
    setNewPhone('');
    setNewPin('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-extrabold text-base leading-tight">Ganti Buku Toko / Usaha</h2>
              <p className="text-xs text-slate-400">Bisa kelola banyak jenis usaha dalam 1 aplikasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* List of Stores */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Daftar Buku Usaha Aktif:</label>

            {stores.map((store) => {
              const isActive = store.id === activeStoreId;
              const typeObj = BUSINESS_TYPES.find((b) => b.id === store.businessType);

              return (
                <div
                  key={store.id}
                  className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-emerald-50/70 border-emerald-600 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStore(store.id);
                      onClose();
                    }}
                    className="flex-1 text-left flex items-center gap-3 min-w-0"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {store.storeName}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {typeObj?.label || store.businessType} {store.ownerName ? `• ${store.ownerName}` : ''}
                      </p>
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {stores.length > 1 && !isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus buku "${store.storeName}" beserta seluruh transaksinya?`)) {
                            onDeleteStore(store.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Buku Toko"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tombol Buat Toko Baru */}
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-3 border-2 border-dashed border-emerald-600 text-emerald-800 font-bold text-xs rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/60 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Tambah Buku Toko / Usaha Baru
            </button>
          ) : (
            <form onSubmit={handleCreateSubmit} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Form Tambah Buku Usaha Baru
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Toko / Usaha *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laundry Berkah / Warung Bu Siti / Usaha Baju"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Pemilik</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Rina"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Usaha</label>
                  <select
                    value={newBusinessType}
                    onChange={(e) => setNewBusinessType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt.id} value={bt.id}>
                        {bt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Simpan & Buka Buku Baru Ini
              </button>
            </form>
          )}

          {/* Info Multi-Device & Cloud Sync untuk Penggunaan Publik */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-xs text-blue-950">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span>Akses Multi-Device (Suami, Istri, Karyawan)</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Semua buku usaha di HP ini aman tersimpan di browser Anda. Ingin buka buku yang sama dari HP lain? Cukup hubungkan dengan sinkronisasi Cloud PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
