# 📖 BukuKasir — Aplikasi Catatan Keuangan Sederhana untuk UMKM

Aplikasi web PWA modern & bersahabat yang dirancang khusus untuk pemilik usaha UMKM usia 35 tahun ke atas. Membantu memisahkan uang toko dan uang pribadi keluarga agar tidak terjadi "bocor halus" di kasir, mencatat utang/piutang (kasbon), dan membagikan rekap transaksi harian ke WhatsApp dalam 1 klik.

---

## ✨ Fitur Unggulan

1. **Pemisahan Pengeluaran Usaha vs Pribadi (Anti Bocor Kasir)**:
   - 🏪 **Pengeluaran Toko**: Kulakan barang, gaji pegawai, listrik toko, sewa ruko.
   - 🏠 **Pengeluaran Pribadi**: Belanja dapur, jajan anak, uang sekolah, bensin pribadi.
   - Memberikan angka riil **Untung Bersih Toko** dan **Sisa Uang di Dompet**.

2. **Dukungan Backdate (Tanggal Mundur)**:
   - Tombol cepat: `[Hari Ini]`, `[Kemarin]`, atau `[Pilih Tanggal]`.
   - Sangat fleksibel untuk mencatat nota kemarin yang belum sempat diinput.

3. **Buku Kasbon & Utang (Debt Book)**:
   - Tab 👥 **Pelanggan Kasbon (Piutang)** & 🏢 **Utang Kita ke Suplier**.
   - Tombol **"Kirim WA"**: Otomatis membuat kata-kata pengingat kasbon yang sopan dan ramah untuk dikirim ke nomor WhatsApp pelanggan.

4. **1-Klik Salin & Kirim Rekap ke WhatsApp**:
   - Menghasilkan ringkasan laporan kas harian yang rapi dengan format WhatsApp (bold, bullet point, emoji).
   - Cocok untuk dikirim ke pasangan, keluarga, atau arsip chat pribadi.

5. **Ekspor Laporan ke Excel (.xlsx)**:
   - Unduh seluruh catatan transaksi ke format Spreadsheet / Excel dalam 1 klik untuk laporan bulanan.

6. **Desain Ramah Lansia / Usia 35+**:
   - Angka rupiah berukuran besar (`24px - 32px`).
   - Tombol aksi jempol besar: `[+ Uang Masuk]` hijau dan `[- Uang Keluar]` merah di bagian bawah layar.
   - Warna kontras tinggi dan teks bahasa Indonesia yang santun & mudah dipahami.

7. **PWA & Offline-First (Guest Mode)**:
   - Siapa pun yang membuka web di Vercel bisa langsung mencoba mencatat tanpa registrasi rumit (tersimpan aman di LocalStorage perangkat).
   - Dapat di-install ke Home Screen Android / iPhone seperti aplikasi bawaan HP.

---

## 🗄️ Arsitektur Database: PostgreSQL Serverless (Neon Postgres)

Aplikasi ini menggunakan **Prisma ORM** yang dioptimalkan untuk **Neon PostgreSQL Serverless**:
- Koneksi pooling bawaan (`pgBouncer`) mencegah error kehabisan koneksi pada serverless lambda Vercel.
- Skema data mencakup: `User`, `Transaction`, `Category`, dan `DebtBook`.

### Menjalankan di Lokal:
```bash
# 1. Masuk ke folder
cd c:\laragon\www\bukukasir

# 2. Jalankan dev server
npm run dev
```
Buka browser di: `http://localhost:3000`

---

## 🚀 Panduan Deploy ke Vercel

1. Buat repositori baru di GitHub dengan nama `bukukasir`.
2. Push seluruh file di folder ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi BukuKasir UMKM"
   git branch -M main
   git remote add origin https://github.com/USERNAME/bukukasir.git
   git push -u origin main
   ```
3. Buka [Vercel Dashboard](https://vercel.com) -> **Add New Project** -> Pilih repositori `bukukasir`.
4. Di bagian **Storage / Integrations** di Vercel:
   - Tambahkan **Neon Postgres** (1-click Free Tier).
   - Vercel akan otomatis mengisi Environment Variable `DATABASE_URL`.
5. Klik **Deploy**! Aplikasi langsung aktif dan dapat diakses publik oleh seluruh UMKM secara real-time.
