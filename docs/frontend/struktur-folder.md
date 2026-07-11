# Struktur Folder Frontend — Next.js (App Router)

Karena kita menggunakan **Next.js App Router** dengan Tailwind CSS, berikut adalah usulan arsitektur standar untuk memisahkan UI dan integrasi API:

```text
santricard-fe/
├── src/
│   ├── app/                    # Halaman Utama (App Router)
│   │   ├── (auth)/             # Route Group untuk Login
│   │   │   └── login/
│   │   │       └── page.tsx    # Halaman Login
│   │   ├── admin/              # Halaman Dashboard Admin
│   │   │   ├── page.tsx
│   │   │   ├── siswa/page.tsx
│   │   │   └── topup/page.tsx
│   │   ├── kantin/             # Halaman Kasir / Kantin
│   │   │   └── page.tsx        # UI untuk Scan QR & Bayar
│   │   ├── ortu/               # Halaman Monitoring Orang Tua
│   │   │   └── page.tsx
│   │   ├── layout.tsx          # Layout utama aplikasi
│   │   └── globals.css         # Import Tailwind CSS
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Komponen dasar (Button, Input, Card)
│   │   ├── qrcode/             # Komponen khusus QR Scanner
│   │   └── layouts/            # Navbar, Sidebar
│   │
│   ├── lib/                    # Library konfigurasi pihak ketiga
│   │   └── axios.ts            # Konfigurasi Axios & Token Interceptor
│   │
│   ├── services/               # Pemanggilan API (Fetch Data)
│   │   ├── authService.ts      # API Login / Logout
│   │   ├── siswaService.ts     # API data siswa
│   │   └── transaksiService.ts # API memproses pembayaran
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   └── useAuth.ts          # Hook mengecek session user
│   │
│   └── types/                  # Definisi tipe data (Jika pakai TypeScript)
│       └── index.ts
│
├── public/                     # Asset statis (Gambar, Logo, Icon)
├── next.config.ts              # Konfigurasi Next.js
├── tailwind.config.ts          # Konfigurasi tema Tailwind (Warna, Font)
└── package.json
```
