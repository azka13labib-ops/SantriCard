# Struktur Folder Backend — Laravel

```
santricard-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── SiswaController.php
│   │   │   ├── KartuController.php
│   │   │   ├── TransaksiController.php
│   │   │   ├── PedagangController.php
│   │   │   ├── SettlementController.php
│   │   │   ├── TopupController.php
│   │   │   └── DashboardController.php
│   │   │
│   │   └── Middleware/
│   │       └── CheckRole.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Siswa.php
│   │   ├── Kartu.php
│   │   ├── Pedagang.php
│   │   ├── Transaksi.php
│   │   ├── Topup.php
│   │   └── Settlement.php
│   │
│   └── Console/
│       └── Commands/
│           └── ResetLimitHarian.php   ← Scheduler reset limit 00:00
│
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_siswa_table.php
│   │   ├── create_kartu_table.php
│   │   ├── create_pedagang_table.php
│   │   ├── create_transaksi_table.php
│   │   ├── create_topup_table.php
│   │   └── create_settlement_table.php
│   │
│   └── seeders/
│       └── SantriCardSeeder.php
│
├── routes/
│   └── api.php                        ← Semua route API
│
└── storage/
    └── app/
        └── public/
            └── qrcodes/               ← File QR code tersimpan di sini
```