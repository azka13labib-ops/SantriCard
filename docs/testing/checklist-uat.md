# Checklist UAT (User Acceptance Testing) & Pra-Rilis

Gunakan checklist ini sebelum merilis sistem SantriCard ke *production* atau melakukan demo ke klien (pengurus pondok pesantren).

---

## Tahap 1: Persiapan Lingkungan (Environment)
- [ ] Server/Hosting sudah disiapkan (PHP 8.1+, MySQL 8+)
- [ ] File `.env` sudah dikonfigurasi menggunakan kredensial *production*
- [ ] `APP_DEBUG=false` sudah diset di file `.env`
- [ ] Migrasi database berjalan tanpa error (`php artisan migrate`)
- [ ] Cron job untuk *Scheduler* reset limit (jam 00:00) sudah dipasang di server

## Tahap 2: Skenario Utama (Happy Path)
- [ ] **Admin** berhasil login
- [ ] **Admin** berhasil menambahkan 1 siswa (dummy) dan QR Code berhasil ter-generate
- [ ] **Admin** berhasil menambahkan 1 pedagang (dummy)
- [ ] **Admin** berhasil melakukan top-up saldo sebesar Rp 100.000 ke siswa tersebut
- [ ] **Pedagang** berhasil login ke dashboard/aplikasi kasir
- [ ] **Pedagang** berhasil men-scan QR Code siswa dan memproses transaksi (misal: Rp 10.000)
- [ ] **Admin/Orang Tua** bisa melihat histori transaksi tersebut, dan sisa limit terpotong dengan benar
- [ ] **Admin** berhasil melakukan pencairan dana (Settlement) ke pedagang tersebut

## Tahap 3: Validasi Keamanan & Keandalan (Edge Cases)
- [ ] **Limit Transaksi:** Transaksi ditolak ketika siswa mencoba berbelanja melebihi batas limit harian (Rp 20.000)
- [ ] **Saldo Kurang:** Transaksi ditolak ketika saldo siswa lebih kecil dari nominal belanja
- [ ] **Kartu Hilang:** Admin me-reissue kartu siswa, dan ketika kartu lama di-scan, transaksi otomatis ditolak
- [ ] **Pedagang Nonaktif:** Admin menonaktifkan pedagang, dan pedagang tersebut tidak bisa login/menerima transaksi
- [ ] **Hak Akses:** Orang Tua mencoba mengakses `/api/siswa` (endpoint admin), dipastikan tertolak (403 Unauthorized)

## Tahap 4: UI/UX & Kesiapan Kasir
- [ ] Aplikasi kasir pedagang mudah digunakan di HP Android biasa (tombol besar, loading tidak lambat)
- [ ] Alert/Pesan error saat transaksi gagal mudah dipahami oleh kasir ("Saldo tidak cukup", "Limit habis")
- [ ] Dashboard Orang Tua tampil responsif ketika diakses via *mobile browser*

---
*Catatan: Centang semua poin di atas. Jika ada yang gagal, kembalikan ke tim developer untuk diperbaiki sebelum rilis resmi.*
