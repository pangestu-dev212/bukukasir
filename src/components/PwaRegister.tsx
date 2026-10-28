'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // 1. Registrasi Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('BukuKasir PWA Service Worker Registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('BukuKasir Service Worker registration failed:', err);
        });
    }

    // 2. Deteksi apakah sudah terpasang sebagai standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    if (isStandalone) {
      return; // Sudah terpasang, tidak perlu banner
    }

    // 3. Deteksi iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Tangkap event beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tampilkan banner jika belum pernah ditutup dalam sesi ini
      const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else if (isIos) {
      alert('Untuk memasang di iPhone/iPad: Ketuk tombol Bagikan (Share) di Safari bawah, lalu pilih "Tambah ke Layar Utama (Add to Home Screen)".');
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-md">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">Pasang Aplikasi BukuKasir</h4>
            <p className="text-[11px] text-slate-300 line-clamp-1">Buka cepat dari layar HP tanpa browser</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            Pasang
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
