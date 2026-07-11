# Alur Sistem — SantriCard

---

## A. Setup Awal (Satu Kali)

```
Admin buka halaman "Tambah Siswa"
↓
Input: nama, kelas, email/nomor orang tua
↓
Sistem generate: kode unik 8-digit + QR code
↓
Admin cetak kartu → serahkan ke siswa
↓
Kartu otomatis ter-link ke akun orang tua
```

---

## B. Top-Up Saldo (via QRIS DANA Bisnis)

```
Orang tua login ke halaman monitoring
↓
Buka menu "Top-Up Saldo"
↓
Sistem menampilkan **QRIS statis (DANA Bisnis)** milik pondok pesantren
↓
Orang tua scan QRIS tersebut menggunakan m-Banking / E-Wallet dan transfer uang
↓
Orang tua mengirimkan/upload *screenshot* bukti transfer (bisa via sistem atau WA Admin)
↓
Admin mengecek mutasi di aplikasi DANA Bisnis
↓
Jika uang sudah masuk, Admin buka halaman "Top-Up" di sistem → pilih siswa → input nominal
↓
Sistem: saldo siswa += nominal, catat log top-up
↓
Orang tua lihat saldo terbaru di app
```

---

## C. Transaksi Jual-Beli (Alur Utama)

```
Siswa datang ke pedagang dengan kartu
↓
Pedagang scan QR/barcode kartu pakai HP
↓
Pedagang input nominal transaksi
↓
Request ke server: { siswa_id, pedagang_id, nominal }
↓
VALIDASI 3-TIER:
  [1] Pedagang aktif & terdaftar?
      └─ Tidak → TOLAK: "Pedagang tidak terdaftar"
  [2] Saldo siswa >= nominal?
      └─ Tidak → TOLAK: "Saldo tidak cukup"
  [3] (SUM transaksi hari ini) + nominal <= 20.000?
      └─ Tidak → TOLAK: "Limit harian habis"
↓
Semua valid → PROSES:
  - saldo siswa -= nominal
  - saldo pedagang += nominal
  - catat ke tabel transaksi (status: berhasil)
↓
Kasir dapat konfirmasi ✓ di layar
↓
Histori orang tua terupdate otomatis
```

---

## D. Reset Limit Harian (Otomatis)

```
Tiap hari jam 00:00 (tengah malam)
↓
Laravel Scheduler jalan otomatis
↓
Reset: sisa_limit semua siswa = 20.000
↓
Besok pagi siswa bisa belanja lagi
```

> Tidak perlu ada interaksi manusia. Ini berjalan sendiri di server.

---

## E. Settlement Pedagang

```
Admin buka halaman "Settlement"
↓
Lihat daftar pedagang + total saldo virtual mereka
  Contoh: Pedagang A → Rp 750.000 (seminggu)
↓
Admin transfer uang cash/transfer bank ke pedagang
↓
Admin klik "Konfirmasi Cairkan" di sistem
↓
Sistem: saldo pedagang = 0, catat log settlement
↓
Pedagang menerima uang riil
```

---

## F. Monitoring Orang Tua

```
Orang tua buka web/app SantriCard
↓
Login dengan akun yang di-link saat pendaftaran
↓
Halaman utama tampil:
  - Nama anak
  - Saldo saat ini: Rp 75.000
  - Sisa limit hari ini: Rp 8.000 / Rp 20.000
  - Histori transaksi 30 hari terakhir
↓
Orang tua bisa lihat detail tiap transaksi:
  tanggal, jam, nama pedagang, nominal, status
```

---

## Catatan Kondisi Desa Pelosok

| Kondisi | Solusi |
|---------|--------|
| Internet mati | Cache transaksi lokal di HP kasir, sync saat online |
| Listrik mati | Kasir pakai HP/tablet (battery-based) |
| Tidak ada bank | Top-up & settlement manual lewat admin |
| Pedagang tidak paham teknologi | UI kasir sangat simpel (scan → nominal → konfirmasi) |
| Kartu hilang | Admin reissue kartu, kode lama otomatis invalid |