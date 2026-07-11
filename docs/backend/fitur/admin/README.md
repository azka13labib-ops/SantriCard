# Fitur Admin (Pondok) — SantriCard

Role **Admin** adalah pemegang kendali utama (Super User) di dalam sistem SantriCard. Admin memiliki wewenang untuk mengelola seluruh data master dan operasional keuangan.

---

## 1. Manajemen Siswa & Kartu
Admin bertugas mendata seluruh santri yang berhak menggunakan SantriCard.
- **Tambah Siswa**: Input nama, kelas, dan menghubungkannya dengan akun Orang Tua.
- **Generate Kartu**: Saat siswa baru ditambahkan, sistem otomatis membuatkan 1 kode unik & file QR Code untuk dicetak.
- **Reissue Kartu**: Jika kartu siswa hilang atau rusak, Admin bisa memblokir kartu lama dan membuatkan QR Code baru (saldo otomatis pindah karena menempel di data siswa, bukan di kartu).
- **Blokir Akun Siswa**: Menonaktifkan akun siswa (misal: jika siswa lulus atau keluar dari pondok).

## 2. Manajemen Pedagang (Kantin)
Admin mendata warung/kantin yang resmi bekerja sama dengan pondok.
- **Tambah Pedagang**: Membuatkan akun login untuk kasir kantin.
- **Nonaktifkan Pedagang**: Jika ada pelanggaran, Admin bisa memblokir akun pedagang sehingga tidak bisa lagi menerima transaksi dari kartu siswa.

## 3. Manajemen Keuangan
- **Top-Up Saldo (Input Manual)**: Admin memverifikasi uang masuk (dari mutasi DANA Bisnis/Rekening), lalu menambahkan saldo virtual ke akun siswa.
- **Settlement (Pencairan Dana)**: Admin melihat total "Saldo Virtual" milik pedagang hasil jualan. Setelah Admin memberikan uang tunai/transfer ke pedagang, Admin akan menekan tombol **Cairkan** di sistem agar saldo virtual pedagang kembali menjadi Rp 0.

## 4. Monitoring & Laporan
- **Dashboard Utama**: Melihat ringkasan total transaksi hari ini, total siswa aktif, dan total pedagang.
- **Riwayat Lengkap**: Bisa melihat seluruh riwayat top-up, transaksi gagal/berhasil, dan settlement yang pernah terjadi di sistem.
