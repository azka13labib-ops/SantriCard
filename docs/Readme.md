# SantriCard — Dokumentasi Project

> Sistem Manajemen Kartu Jual-Beli Pondok Pesantren

---

## Struktur Dokumentasi

```
docs/
├── README.md                         ← kamu di sini
│
├── overview/
│   ├── PRD.md                        ← Product Requirements Document (lengkap)
│   ├── alur-sistem.md                ← Alur sistem step-by-step
│   └── aktor-dan-peran.md            ← Siapa saja yang terlibat
│
├── database/
│   ├── schema.md                     ← Desain tabel database
│   └── migration-guide.md            ← Panduan membuat migration Laravel
│
├── api/
│   ├── endpoints.md                  ← Daftar semua endpoint API
│   ├── auth.md                       ← Autentikasi & Authorization
│   └── error-codes.md                ← Kode error & response format
│
├── backend/
│   ├── setup.md                      ← Setup project Laravel
│   ├── struktur-folder.md            ← Struktur folder Laravel
│   └── fitur/
│       ├── admin/
│       │   ├── README.md             ← Deskripsi peran Admin
│       │   ├── topup.md              ← Fitur top-up saldo via QRIS DANA
│       │   ├── pedagang.md           ← Manajemen pedagang mitra
│       │   ├── settlement.md         ← Pencairan dana pedagang
│       │   └── scheduler.md          ← Reset limit harian otomatis
│       ├── kantin/
│       │   ├── README.md             ← Deskripsi peran Kantin
│       │   └── transaksi.md          ← Logic transaksi & validasi limit
│       └── ortu/
│           └── README.md             ← Deskripsi peran Orang Tua
│
├── frontend/
│   ├── setup.md                      ← Setup project React
│   ├── struktur-folder.md            ← Struktur folder React
│   └── halaman/
│       ├── admin-dashboard.md        ← Halaman dashboard admin
│       ├── transaksi-kasir.md        ← Halaman kasir/pedagang scan kartu
│       └── parent-monitoring.md      ← Halaman monitoring orang tua
│
├── testing/
│   ├── test-cases.md                 ← Test case untuk semua fitur
│   └── checklist-uat.md              ← Checklist UAT sebelum rilis
```

---

## Quick Links

| Dokumen | Keterangan |
|---------|-----------|
| [PRD Lengkap](./overview/PRD.md) | Requirements & scope project |
| [Alur Sistem](./overview/alur-sistem.md) | Flow transaksi step-by-step |
| [Database Schema](./database/schema.md) | Desain tabel & relasi |
| [API Endpoints](./api/endpoints.md) | Semua endpoint Laravel |
| [Setup Backend](./backend/setup.md) | Cara mulai project Laravel |
| [Setup Frontend](./frontend/setup.md) | Cara mulai project React |
| [Test Cases](./testing/test-cases.md) | Testing semua fitur |

---

## Stack Teknologi

| Layer | Teknologi |
|-------|----------|
| Backend | Laravel 10+ |
| Frontend | React |
| Database | MySQL |
| Queue/Scheduler | Laravel Scheduler (cron) |
| Auth | Laravel Sanctum |
| QR Code | `simplesoftwareio/simple-qrcode` |
