'use client';

import React, { useState, useRef } from 'react';
import { X, Store, Check, Upload, Trash2, Camera, Sparkles } from 'lucide-react';
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
  const [logo, setLogo] = useState<string | undefined>(profile.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setStoreName(profile.storeName || '');
      setOwnerName(profile.ownerName || '');
      setBusinessType(profile.businessType || 'WARUNG');
      setLogo(profile.logo);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Kompresi gambar otomatis di sisi HP (Client-Side)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256; // Ukuran avatar optimal 256x256
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Kompresi ke format WebP ringan (~20-35 KB)
          const compressed = canvas.toDataURL('image/webp', 0.82) || canvas.toDataURL('image/jpeg', 0.82);
          setLogo(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      logo,
      phone: profile.phone,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base">Pengaturan Profil Usaha</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Bagian Upload Logo / Foto Toko */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 border-2 border-dashed border-teal-500/50 flex items-center justify-center overflow-hidden shadow-inner relative">
                {logo ? (
                  <img src={logo} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-9 h-9 text-teal-600/70" />
                )}
              </div>

              {/* Tombol Kamera di Atas Avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:scale-105 active:scale-95 transition"
                title="Pilih Foto / Logo Toko"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition"
              >
                {logo ? 'Ganti Foto / Logo' : '+ Pasang Logo Toko'}
              </button>

              {logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition"
                  title="Hapus Logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Foto otomatis dikompres ringan (&lt;40 KB) & anti beban server.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko / Usaha *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: Warung Berkah / Toko Kelontong"
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik (Opsional)</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Contoh: Bu Aylin / Pak Budi"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Usaha UMKM</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 bg-white"
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
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition active:scale-95"
            >
              Simpan Profil Toko
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
