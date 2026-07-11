# Database Schema — SantriCard

---

## Daftar Tabel

1. `users` — akun login semua role
2. `siswa` — data siswa & saldo
3. `kartu` — kartu unik per siswa
4. `pedagang` — data pedagang mitra
5. `transaksi` — semua transaksi jual-beli
6. `topup` — riwayat top-up saldo
7. `settlement` — riwayat pencairan dana pedagang

---

## Tabel: `users`

Akun login untuk admin, pedagang, dan orang tua.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| name | varchar(100) | Nama lengkap |
| email | varchar(150) | Email login, unique |
| password | varchar(255) | Bcrypt hash |
| role | enum | `admin`, `pedagang`, `ortu`, `guru` |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

## Tabel: `siswa`

Data siswa pondok.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| nama | varchar(100) | Nama lengkap siswa |
| kelas | varchar(50) | Kelas/kamar siswa |
| saldo | decimal(10,2) | Saldo virtual saat ini |
| limit_harian | decimal(10,2) | Default: 20000 |
| user_id_ortu | bigint FK | Relasi ke tabel users (role: ortu) |
| aktif | boolean | Default: true |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

## Tabel: `kartu`

Kartu unik yang dipegang siswa.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| siswa_id | bigint FK | Relasi ke tabel siswa |
| kode_unik | varchar(20) | Kode 8-digit unik, index |
| qr_code_path | varchar(255) | Path file QR code yang digenerate |
| aktif | boolean | False jika kartu direissue/diblokir |
| created_at | timestamp | — |
| updated_at | timestamp | — |

> Satu siswa bisa punya banyak baris kartu (jika pernah reissue), tapi hanya 1 yang `aktif = true`.

---

## Tabel: `pedagang`

Data pedagang mitra pondok.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| nama | varchar(100) | Nama pedagang / warung |
| user_id | bigint FK | Relasi ke tabel users (role: pedagang) |
| saldo_virtual | decimal(10,2) | Saldo akumulasi belum dicairkan |
| aktif | boolean | Jika false, tidak bisa terima transaksi |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

## Tabel: `transaksi`

Log semua transaksi (berhasil maupun ditolak).

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| siswa_id | bigint FK | Relasi ke tabel siswa |
| pedagang_id | bigint FK | Relasi ke tabel pedagang |
| nominal | decimal(10,2) | Jumlah transaksi |
| status | enum | `berhasil`, `ditolak` |
| alasan_ditolak | varchar(100) | Nullable. Isi jika ditolak |
| created_at | timestamp | Waktu transaksi (dipakai untuk cek limit harian) |
| updated_at | timestamp | — |

> Kolom `created_at` sangat penting — dipakai untuk query:
> ```sql
> SELECT SUM(nominal) FROM transaksi
> WHERE siswa_id = ? AND DATE(created_at) = CURDATE() AND status = 'berhasil'
> ```

---

## Tabel: `topup`

Riwayat top-up saldo siswa.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| siswa_id | bigint FK | Relasi ke tabel siswa |
| nominal | decimal(10,2) | Jumlah top-up |
| admin_id | bigint FK | Admin yang melakukan top-up |
| catatan | text | Opsional: keterangan (titipan orang tua, dll) |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

## Tabel: `settlement`

Riwayat pencairan dana pedagang.

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| pedagang_id | bigint FK | Relasi ke tabel pedagang |
| nominal | decimal(10,2) | Jumlah yang dicairkan |
| admin_id | bigint FK | Admin yang melakukan settlement |
| status | enum | `pending`, `selesai` |
| catatan | text | Opsional: nomor rekening, metode cairkan |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

## Relasi Antar Tabel

```
users ──────┬──── siswa (via user_id_ortu)
            └──── pedagang (via user_id)

siswa ──────┬──── kartu (1 siswa, banyak kartu, 1 aktif)
            ├──── transaksi (1 siswa, banyak transaksi)
            └──── topup (1 siswa, banyak top-up)

pedagang ───┬──── transaksi (1 pedagang, banyak transaksi)
            └──── settlement (1 pedagang, banyak settlement)
```