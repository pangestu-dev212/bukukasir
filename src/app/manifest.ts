import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BukuKasir UMKM — Catatan Keuangan',
    short_name: 'BukuKasir',
    description: 'Catatan keuangan sederhana untuk UMKM: pisahkan uang toko dan pribadi, catat kasbon, dan salin rekap ke WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f1f5f9',
    theme_color: '#065f46',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
