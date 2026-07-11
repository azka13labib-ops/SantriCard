# TODO List Pembangunan SantriCard

Checklist ini adalah panduan langkah demi langkah untuk Anda (developer) dalam membangun sistem SantriCard dari nol hingga selesai, berdasarkan dokumentasi yang sudah kita buat.

Gunakan file ini untuk melacak *progress* (perkembangan) Anda. Ubah `[ ]` menjadi `[x]` jika sudah selesai.

---

## Tahap 1: Persiapan & Setup Awal
- [ ] Install Laravel 10+ (`composer create-project laravel/laravel santricard-api`)
- [ ] Setup konfigurasi database di file `.env`
- [ ] Install Laravel Sanctum (`composer require laravel/sanctum`)
- [ ] Install library QR Code (`composer require simplesoftwareio/simple-qrcode`)

## Tahap 2: Database & Migrasi
*(Referensi: `docs/database/migration-guide.md` & `schema.md`)*
- [ ] Buat file migration untuk `users`
- [ ] Buat file migration untuk `siswa`
- [ ] Buat file migration untuk `kartu`
- [ ] Buat file migration untuk `pedagang`
- [ ] Buat file migration untuk `transaksi`
- [ ] Buat file migration untuk `topup`
- [ ] Buat file migration untuk `settlement`
- [ ] Jalankan `php artisan migrate`

## Tahap 3: Model & Relasi
- [ ] Buat Model `User` dan set up role (`admin`, `pedagang`, `ortu`)
- [ ] Buat Model `Siswa` (relasi ke `User` ortu, `Kartu`, `Transaksi`, `Topup`)
- [ ] Buat Model `Kartu` (relasi ke `Siswa`)
- [ ] Buat Model `Pedagang` (relasi ke `User`, `Transaksi`, `Settlement`)
- [ ] Buat Model `Transaksi` (relasi ke `Siswa`, `Pedagang`)
- [ ] Buat Model `Topup` dan `Settlement`
- [ ] Buat Seeder (`SantriCardSeeder`) untuk data dummy (1 admin, 5 siswa, 3 pedagang)

## Tahap 4: Autentikasi & Keamanan
*(Referensi: `docs/api/auth.md`)*
- [ ] Buat `AuthController` (Fungsi Login & Logout)
- [ ] Buat Custom Middleware `CheckRole` (untuk filter akses route berdasarkan role admin/pedagang/ortu)
- [ ] Setup route API di `routes/api.php` dan bungkus dengan middleware Sanctum & Role

## Tahap 5: Fitur Backend Utama (Controllers)
*(Referensi: `docs/api/endpoints.md`)*
- [ ] Buat `SiswaController` (CRUD siswa, generate kartu, dan block kartu)
- [ ] Buat `TopupController` (Logika tambah saldo siswa)
- [ ] Buat `PedagangController` (CRUD pedagang)
- [ ] Buat `TransaksiController` (Logika inti: Validasi pedagang -> Validasi Saldo -> Validasi Limit -> Potong Saldo)
- [ ] Buat `SettlementController` (Logika pencairan dana pedagang ke 0)
- [ ] Buat `DashboardController` (API ringkasan untuk admin)

## Tahap 6: Cron Job & Scheduler
*(Referensi: `docs/architecture/alur-sistem.md`)*
- [ ] Buat Command Artisan (`php artisan make:command ResetLimitHarian`)
- [ ] Daftarkan command tersebut di `app/Console/Kernel.php` agar jalan setiap jam 00:00 (otomatisasi *refresh* limit harian)

## Tahap 7: Frontend Web Apps (React/Blade)
- [ ] Setup project Frontend (Vite/React atau Laravel Blade)
- [ ] Buat **Halaman Login** (Semua Role)
- [ ] Buat **Dashboard Admin** (Kelola Siswa, Top-Up, Pedagang, Settlement)
- [ ] Buat **Halaman Kasir Pedagang** (Tampilan untuk kamera HP scan QR Code & Input Nominal)
- [ ] Buat **Halaman Monitoring Orang Tua** (Tampilan sisa saldo & list histori jajan)

## Tahap 8: Pengujian (Testing)
*(Referensi: `docs/testing/test-cases.md`)*
- [ ] Testing skenario Transaksi Normal (Happy Path)
- [ ] Testing skenario Saldo Habis
- [ ] Testing skenario Limit Habis
- [ ] Melakukan UAT (User Acceptance Test) sesuai checklist
- [ ] Demo ke klien (Pihak Pondok)
