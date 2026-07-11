# API Endpoints — SantriCard

> Base URL: `https://yourdomain.com/api`  
> Auth: Bearer Token (Laravel Sanctum)  
> Format: JSON

---

## Auth

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/login` | Semua | Login, dapat token |
| POST | `/auth/logout` | Semua | Logout, hapus token |

### Contoh request login

```json
POST /api/auth/login
{
  "email": "admin@pondok.com",
  "password": "password123"
}
```

### Contoh response berhasil

```json
{
  "token": "2|abc123...",
  "user": {
    "id": 1,
    "name": "Admin Pondok",
    "role": "admin"
  }
}
```

---

## Siswa

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/siswa` | admin | Daftar semua siswa |
| POST | `/siswa` | admin | Tambah siswa baru + generate kartu |
| GET | `/siswa/{id}` | admin, ortu | Detail siswa |
| PATCH | `/siswa/{id}` | admin | Update data siswa |
| DELETE | `/siswa/{id}` | admin | Nonaktifkan siswa |
| POST | `/siswa/{id}/topup` | admin | Top-up saldo siswa |
| GET | `/siswa/{id}/saldo` | admin, ortu | Cek saldo & sisa limit hari ini |
| GET | `/siswa/{id}/histori` | admin, ortu | Histori transaksi (30 hari) |
| POST | `/siswa/{id}/reissue-kartu` | admin | Generate ulang kartu (jika hilang) |

### Contoh response `/siswa/{id}/saldo`

```json
{
  "siswa_id": 5,
  "nama": "Ahmad Fauzi",
  "saldo": 75000,
  "limit_harian": 20000,
  "terpakai_hari_ini": 12000,
  "sisa_limit": 8000
}
```

---

## Transaksi

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/transaksi` | pedagang | Proses transaksi jual-beli |
| GET | `/transaksi` | admin | Semua transaksi (bisa filter tanggal) |
| GET | `/transaksi/{id}` | admin, pedagang | Detail satu transaksi |

### Contoh request transaksi

```json
POST /api/transaksi
{
  "kode_kartu": "SC-00123",
  "nominal": 15000
}
```

> `pedagang_id` diambil dari token login pedagang, bukan dari request body.

### Contoh response berhasil

```json
{
  "status": "berhasil",
  "transaksi_id": 88,
  "nominal": 15000,
  "sisa_saldo": 60000,
  "sisa_limit": 5000,
  "siswa": "Ahmad Fauzi",
  "pedagang": "Warung Bu Siti"
}
```

### Contoh response ditolak

```json
{
  "status": "ditolak",
  "alasan": "Limit harian habis",
  "sisa_limit": 3000,
  "nominal_diminta": 15000
}
```

---

## Pedagang

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/pedagang` | admin | Daftar semua pedagang |
| POST | `/pedagang` | admin | Daftarkan pedagang baru |
| GET | `/pedagang/{id}` | admin, pedagang | Detail pedagang |
| PATCH | `/pedagang/{id}` | admin | Update data / status aktif |
| GET | `/pedagang/{id}/penjualan` | admin, pedagang | Total penjualan & histori |

---

## Settlement

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/settlement` | admin | Daftar semua settlement |
| POST | `/settlement` | admin | Buat settlement untuk pedagang |
| GET | `/settlement/{id}` | admin | Detail settlement |

### Contoh request settlement

```json
POST /api/settlement
{
  "pedagang_id": 3,
  "catatan": "Transfer BRI atas nama Siti Aminah"
}
```

---

## Dashboard Admin

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/dashboard` | admin | Ringkasan: total transaksi hari ini, total siswa, total pedagang aktif |

### Contoh response dashboard

```json
{
  "transaksi_hari_ini": {
    "total": 45,
    "berhasil": 42,
    "ditolak": 3,
    "nominal_total": 630000
  },
  "siswa": {
    "total": 120,
    "aktif": 118
  },
  "pedagang": {
    "total": 8,
    "aktif": 7
  }
}
``` 