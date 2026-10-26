'use client';

import React, { useState } from 'react';
import { X, Store, Check } from 'lucide-react';
import { UserProfile, BUSINESS_TYPES } from '@/lib/types';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

export function ProfileModal({ isOpen, profile, onClose, onSave }: ProfileModalProps) {
  const [storeName, setStoreName] = useState<string>(profile.storeName || '');
  const [ownerName, setOwnerName] = useState<string>(profile.ownerName || '');
  const [businessType, setBusinessType] = useState<string>(profile.businessType || 'WARUNG');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert('Nama toko wajib diisi');
      return;
    }
    onSave({
      ...profile,
      storeName: storeName.trim(),
      ownerName: ownerName.trim(),
      businessType,
      phone: profile.phone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base">Pengaturan Profil Usaha</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko / Usaha *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: Toko Berkah Ibu / Warung Bu Siti"
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik (Opsional)</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Contoh: Bu Siti / Pak Joko"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Usaha UMKM</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            >
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              Simpan Profil Toko
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
