# 💎 ArthaWise — Aplikasi Pencatat Keuangan Pribadi Modern

Aplikasi pencatat keuangan (bookkeeping) pribadi yang dirancang cepat, elegan, responsif di HP & Desktop, serta **dapat diakses di mana saja** dengan penyimpanan data di aplikasi dan sinkronisasi Cloud.

---

## ✨ Fitur Unggulan

1. **Ringkasan Finansial Real-time (Dashboard)**:
   - Total saldo dari seluruh dompet & rekening bank.
   - Pemasukan bulanan, pengeluaran bulanan, dan arus kas bersih (*net savings*).
   - Tombol sembunyikan/tampilkan nominal saldo (*privacy mode*).
   - Pintasan aksi cepat: *+ Pengeluaran*, *+ Pemasukan*, dan *Transfer Antar Akun*.

2. **Pencatatan Transaksi Cepat & Fleksibel**:
   - Format otomatis mata uang Rupiah (`Rp`).
   - Tombol pintas nominal cepat (`+10rb`, `+50rb`, `+100rb`, `+500rb`).
   - Kategori lengkap dengan ikon & warna (Makanan, Transportasi, Belanja, Tagihan/Listrik, Hiburan, Medis, Gaji, Freelance, dll.).
   - Pilihan dompet asal/tujuan penyimpanan.

3. **Multi-Dompet & Rekening (Wallets)**:
   - Dukungan berbagai dompet: Tunai (Cash), Bank BCA, Bank Mandiri, GoPay/e-Wallet, dll.
   - Tambah dan edit akun/rekening sesuai kebutuhan.
   - Fitur **Transfer Saldo Antar Akun** (contoh: Tarik Tunai dari BCA ke Dompet, atau Top-Up GoPay dari Rekening).

4. **Anggaran & Kuota Bulanan (Budgeting)**:
   - Tetapkan batas maksimal pengeluaran per kategori.
   - *Progress bar* visual dengan peringatan otomatis: Aman (Hijau), Waspada (Kuning > 75%), atau Melebihi Anggaran (Merah > 100%).

5. **Visualisasi & Analisis Pengeluaran**:
   - Donut Chart interaktif pembagian alokasi per kategori.
   - Peringkat 5 pengeluaran terbesar.
   - Rasio tabungan (*Savings Rate*) dan tips finansial cerdas (rumus 50/30/20).

6. **Akses Di Mana Saja & Sinkronisasi Cloud**:
   - **Mode Lokal Otomatis**: Tetap berfungsi 100% secara offline di browser tanpa perlu koneksi internet.
   - **Sinkronisasi Cloud (Google Firebase Firestore)**: Hubungkan Firebase Config gratis agar data langsung tersinkron di HP dan Laptop secara bersamaan.
   - **Ekspor Excel / CSV**: Unduh berkas CSV rapi yang dapat langsung dibuka di Microsoft Excel atau Google Sheets.
   - **Cadangan Penuh (JSON)**: Fitur Backup & Restore data catatan kapan saja.

7. **Desain & Pengalaman Pengguna (UI/UX)**:
   - Dark Mode & Light Mode yang elegan.
   - Navigasi khusus smartphone (*Mobile Bottom Navigation Bar* + *Floating Action Button*).
   - PWA Ready (*Progressive Web App*) — dapat di-*Add to Home Screen* di Android & iOS.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js sudah terpasang, lalu di terminal folder ini jalankan:

```bash
# Menjalankan server lokal (otomatis mendukung akses HP lewat Wi-Fi)
npm run dev
```

Terminal akan menampilkan tautan:
- **Local**: `http://localhost:5173/` (Buka di browser komputer)
- **Network**: `http://192.168.x.x:5173/` (Buka tautan ini di browser HP Anda yang tersambung ke Wi-Fi yang sama!)

---

## 📱 Cara Membuka Dari HP di Mana Saja (Hosting Gratis)

Agar aplikasi bisa diakses melalui internet dari mana saja tanpa harus menyalakan komputer:

### Opsi A: Deploy ke Vercel (Rekomendasi - 100% Gratis)
1. Buat repository baru di GitHub dan push project ini:
   ```bash
   git add .
   git commit -m "feat: inisialisasi ArthaWise catat keuangan"
   git remote add origin https://github.com/USERNAME/catat-keuangan.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com) &gt; *Add New Project* &gt; Pilih repository GitHub ini.
3. Klik **Deploy**. Dalam 1 menit, Anda akan mendapatkan URL publik (contoh: `https://arthawise-keuangan.vercel.app`) yang bisa dibuka langsung di HP kapan saja!

### Opsi B: Firebase Hosting
```bash
npm run build
npx -y firebase-tools init hosting
npx -y firebase-tools deploy --only hosting
```

---

## ☁️ Menghubungkan Cloud Firestore (Gratis)

1. Buka [Firebase Console](https://console.firebase.google.com) lalu buat project baru gratis.
2. Di menu **Firestore Database**, klik **Create Database**, pilih lokasi server terdekat (e.g. `asia-southeast2` / Jakarta), dan pilih aturan **Test Mode**.
3. Buka **Project Settings** &gt; scroll ke bawah dan klik ikon **Web (`</>`)** untuk menambahkan web app.
4. Salin kode `firebaseConfig` yang muncul.
5. Di aplikasi ArthaWise, klik tombol **Pengaturan & Cloud** di pojok kanan atas, tempelkan konfigurasi tersebut, lalu klik **Simpan & Hubungkan Cloud**.
6. Selesai! Data Anda sekarang otomatis tersimpan di Cloud dan tersinkronisasi di setiap perangkat.
