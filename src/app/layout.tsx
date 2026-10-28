import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BukuKasir — Aplikasi Buku Kas & Kasir Warung UMKM',
  description: 'Catat kasir harian, pisahkan kas toko dari dompet dapur, kelola kasbon pelanggan, dan rekap otomatis ke WhatsApp.',
  applicationName: 'BukuKasir',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BukuKasir',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
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
    <html lang="id" className={`h-full antialiased ${inter.className}`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 select-none sm:select-auto">
        {children}
      </body>
    </html>
  );
}
