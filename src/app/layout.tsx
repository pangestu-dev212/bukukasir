import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BukuKasir — Catatan Keuangan UMKM Mudah & Terpisah',
  description: 'Pencatatan kas UMKM sederhana: pisahkan uang toko dan pribadi, catat kasbon, dan salin rekap ke WhatsApp dalam 1 klik.',
  applicationName: 'BukuKasir',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BukuKasir',
  },
};

export const viewport: Viewport = {
  themeColor: '#065f46',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased bg-slate-100">
      <body className="min-h-full flex flex-col font-sans select-none sm:select-auto">
        {children}
      </body>
    </html>
  );
}
