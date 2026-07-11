# Fitur Orang Tua (Wali) — SantriCard

Role **Orang Tua** (Atau Wali) disediakan agar keluarga yang berada di rumah (jauh dari pondok pesantren) bisa mengawasi pengeluaran dan menjamin uang saku anak aman tanpa memberikan uang tunai dalam jumlah besar.

Akses akun ini bersifat **Read-Only** (hanya bisa melihat, tidak bisa mengedit data).

---

## 1. Monitoring Saldo & Limit Real-time
Begitu login ke web/aplikasi, Orang Tua akan langsung melihat:
- **Saldo Tersisa**: Jumlah uang yang masih bisa dipakai oleh anak.
- **Sisa Limit Hari Ini**: (Contoh: "Anak Anda sudah jajan Rp 12.000 hari ini. Sisa limit hari ini: Rp 8.000").
*Catatan: Limit harian (misal maksimal Rp 20.000/hari) ditentukan oleh kebijakan pondok agar santri tidak boros.*

## 2. Histori Jajan (Riwayat Transaksi)
Orang tua bisa melacak ke mana saja uang saku anak mengalir.
- Menampilkan daftar transaksi 30 hari terakhir.
- Menampilkan Jam transaksi, Nominal, dan **Nama Warung/Kantin** tempat anak tersebut jajan.
- Menampilkan status transaksi (apakah berhasil, atau gagal karena saldo kurang/limit habis).

## 3. Instruksi Top-Up (Isi Saldo)
Terdapat halaman khusus "Top-Up Saldo" yang mempermudah orang tua mengirim uang saku tambahan.
- Menampilkan **Gambar Barcode QRIS DANA Bisnis** milik pondok pesantren.
- Orang tua cukup melakukan *screenshot* atau *scan* gambar QRIS tersebut menggunakan aplikasi E-Wallet (OVO, GoPay, DANA) atau m-Banking (BCA Mobile, Livin, dll) dari rumah.
- Terdapat tombol/link untuk mengirimkan bukti transfer via WhatsApp ke nomor Admin Pondok agar saldo anak segera ditambahkan di sistem.

---
*Keamanan: Akun Orang Tua diikat langsung ke ID Siswa milik anaknya. Sehingga Orang Tua A tidak akan pernah bisa melihat saldo atau riwayat jajan milik anak B.*
