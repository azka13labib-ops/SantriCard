<div align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-blue.svg" alt="Status">
  <img src="https://img.shields.io/badge/Backend-Laravel%2013-FF2D20.svg?logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/Frontend-Next.js-000000.svg?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css" alt="Tailwind">

  <h1>SantriCard</h1>
  <p><strong>Sistem Manajemen Uang Saku & Kartu Jajan Pondok Pesantren</strong></p>
</div>

---

**SantriCard** adalah sebuah platform digital tertutup (*closed-loop*) yang dirancang khusus untuk digitalisasi ekosistem keuangan di lingkungan pondok pesantren. Dengan sistem ini, santri tidak perlu lagi membawa uang tunai; cukup menggunakan satu kartu pintar (QR Code) untuk seluruh transaksi jajan sehari-hari.

## Fitur Utama

- **Tanpa Uang Tunai (Cashless)** - Transaksi aman menggunakan kartu berbasis QR Code.
- **Aplikasi Kasir Cepat** - Kantin/Pedagang cukup scan QR kartu menggunakan kamera HP untuk memotong saldo santri.
- **Limit Jajan Harian** - Pondok bisa mengatur batas maksimal pengeluaran harian santri agar tidak boros.
- **Monitoring Orang Tua** - Orang tua bisa mengecek sisa saldo & riwayat jajan anaknya secara *real-time* dari rumah.
- **Top-Up Otomatis** - Mendukung top-up via QRIS statis (DANA Bisnis) yang dikelola langsung oleh admin pondok.

## Tech Stack

Project ini menggunakan arsitektur modern yang memisahkan Backend API dan Frontend Web:

- **Backend API:** Laravel 13, PHP 8.2+, MySQL 8+
- **Frontend Web:** Next.js (App Router), React 19, Tailwind CSS
- **Autentikasi:** Laravel Sanctum (Token-based)
- **Data Fetching:** Axios

## Struktur Repositori

Proyek ini disusun dalam bentuk *monorepo* sederhana:

```text
SantriCard/
├── santricard-be/      # Folder Backend (Laravel API)
├── santricard-fe/      # Folder Frontend (Next.js App)
└── docs/               # Berisi seluruh dokumentasi teknis & arsitektur sistem
```

## Dokumentasi Lengkap

Kami telah menyusun dokumentasi yang sangat komprehensif terkait rancangan sistem, skema database, API, dan alur aplikasi. Silakan jelajahi folder `docs/` atau klik tautan cepat di bawah ini:

- [PRD (Product Requirements Document)](./docs/overview/PRD.md)
- [Alur Sistem & Logika Bisnis](./docs/overview/alur-sistem.md)
- [Desain Skema Database](./docs/database/schema.md)
- [Daftar Endpoint API](./docs/api/endpoints.md)
- [Skenario Testing (UAT)](./docs/testing/test-cases.md)

*(Jika Anda ingin melihat dokumentasi selengkapnya, baca file [docs/Readme.md](./docs/Readme.md))*

## Cara Menjalankan di Lokal (Local Development)

### 1. Jalankan Backend (Laravel)
```bash
cd santricard-be
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Jalankan Frontend (Next.js)
```bash
cd santricard-fe
pnpm install
# Jangan lupa atur variabel environment (jika ada) untuk menembak API Laravel
pnpm dev
```
Buka `http://localhost:3000` di browser Anda.

---
<div align="center">
  Dibuat untuk kemajuan digitalisasi pesantren.
</div>
