import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
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
    <html lang="id" className={`h-full antialiased ${plusJakarta.className}`}>
      <body className="min-h-full flex flex-col select-none sm:select-auto">
        {children}
      </body>
    </html>
  );
}
