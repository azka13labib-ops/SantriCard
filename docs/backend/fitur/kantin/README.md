# Fitur Kantin (Pedagang) — SantriCard

Role **Kantin** atau **Pedagang** digunakan oleh pihak penjual (kasir) di lingkungan pondok pesantren. Aplikasi untuk role ini didesain sesederhana mungkin karena hanya fokus pada proses penerimaan pembayaran secara cepat.

---

## 1. Menerima Pembayaran (Scan QR)
Ini adalah fungsi paling krusial di seluruh sistem SantriCard.
- **Proses Kasir**:
  1. Kasir membuka aplikasi (bisa lewat browser HP).
  2. Kamera HP akan aktif dan bertindak sebagai *scanner*.
  3. Siswa menunjukkan Kartu SantriCard mereka.
  4. Kasir men-scan barcode/QR Code pada kartu tersebut.
  5. Kasir mengetikkan nominal belanja (misal: Rp 12.000).
  6. Kasir menekan tombol "Bayar".
- **Validasi Otomatis**: Sistem di belakang layar akan memastikan saldo siswa cukup, limit harian belum lewat batas, dan kartu belum diblokir.
- **Hasil Akhir**: Jika berhasil, muncul tanda centang hijau ✓ dan saldo siswa otomatis terpotong. Saldo virtual kantin akan bertambah.

## 2. Pengecekan Riwayat Jualan (Histori)
- **Hari Ini**: Kasir bisa melihat total pendapatan (penjualan) khusus untuk hari ini secara *real-time*.
- **Daftar Transaksi**: Menampilkan daftar transaksi terakhir (jam berapa, nominal berapa, transaksi berhasil atau ditolak karena saldo kurang).
- *Catatan:* Kasir tidak bisa melihat nama lengkap siswa untuk alasan privasi, atau hanya melihat inisial/nama panggilan saja.

## 3. Pengecekan Saldo Virtual
- Menampilkan total "Uang Mengendap" (Saldo Virtual) hasil jualan yang belum dicairkan (*settlement*) oleh Admin Pondok. 
- Saat Admin sudah melakukan pencairan/memberikan uang tunai ke kantin, angka saldo virtual ini akan kembali menjadi Rp 0.
