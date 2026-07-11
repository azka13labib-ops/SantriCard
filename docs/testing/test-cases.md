# Test Cases — SantriCard

Dokumen ini berisi skenario pengujian (UAT/QA) untuk memastikan semua fitur berjalan sesuai requirement.

---

## 1. Modul Autentikasi (Auth)

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| AUTH-01 | Login Admin Sukses | 1. Masukkan email & password admin valid<br>2. Klik Login | Sistem mengembalikan Bearer Token, diarahkan ke Dashboard Admin |
| AUTH-02 | Login Password Salah | 1. Masukkan email valid, password salah | Response 401 Unauthorized, pesan error "Kredensial salah" |
| AUTH-03 | Login Pedagang | 1. Masukkan akun pedagang | Token diterima, diarahkan ke halaman Kasir Pedagang |
| AUTH-04 | Login Orang Tua | 1. Masukkan akun ortu | Token diterima, diarahkan ke halaman Monitoring Anak |

---

## 2. Modul Manajemen Siswa & Kartu

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| SSW-01 | Tambah Siswa Baru | 1. Admin isi form siswa (nama, kelas, wali)<br>2. Submit | Data siswa tersimpan, Kartu (kode unik & QR) otomatis digenerate (aktif=true) |
| SSW-02 | Reissue Kartu (Kartu Hilang) | 1. Admin klik "Reissue Kartu" untuk siswa X | Kartu lama (aktif=false), Kartu baru (aktif=true) digenerate, kode unik baru |
| SSW-03 | Blokir Siswa | 1. Admin set status siswa menjadi non-aktif | Status siswa menjadi non-aktif, kartu tidak bisa dipakai transaksi |

---

## 3. Modul Saldo (Top-Up)

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| TOP-01 | Top-up Saldo Sukses | 1. Admin pilih siswa, input nominal Rp 50.000<br>2. Submit | Saldo siswa bertambah Rp 50.000, tercatat di log tabel `topup` |
| TOP-02 | Nominal Top-up Negatif | 1. Admin input nominal -50000 | Form menolak, validasi error (nominal harus > 0) |

---

## 4. Modul Transaksi (Core Feature)

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| TRX-01 | Transaksi Sukses | 1. Pedagang aktif scan QR kartu (saldo cukup, limit cukup)<br>2. Input nominal Rp 10.000 | Response Sukses. Saldo siswa berkurang, saldo_virtual pedagang bertambah, histori tercatat |
| TRX-02 | Saldo Tidak Cukup | 1. Scan kartu dengan saldo Rp 5.000<br>2. Input nominal Rp 10.000 | Response 422 `SALDO_INSUFFICIENT`, transaksi tercatat sebagai 'ditolak' |
| TRX-03 | Limit Harian Habis | 1. Siswa sudah belanja Rp 15.000 hari ini<br>2. Transaksi baru Rp 10.000 | Response 422 `LIMIT_EXCEEDED` (karena total Rp 25.000 > limit Rp 20.000) |
| TRX-04 | Kartu Tidak Valid / Lama | 1. Scan QR kode unik kartu yang sudah di-reissue (nonaktif) | Response 422 `KARTU_INACTIVE` / `KARTU_NOT_FOUND` |
| TRX-05 | Pedagang Tidak Aktif | 1. Akun pedagang dinonaktifkan admin<br>2. Pedagang coba buat transaksi | Response 422 `PEDAGANG_INACTIVE`, transaksi ditolak |

---

## 5. Modul Settlement (Pencairan Dana)

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| STL-01 | Settlement Sukses | 1. Admin pilih pedagang yang punya saldo virtual<br>2. Klik Cairkan | Saldo virtual pedagang menjadi 0, tercatat di log `settlement` (status selesai) |
| STL-02 | Settlement Saldo Kosong | 1. Admin klik cairkan pada pedagang bersaldo 0 | Tombol disable atau error "Saldo pedagang Rp 0" |

---

## 6. Modul Scheduler (Cron Job)

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| CRN-01 | Reset Limit Harian | 1. Ubah waktu server ke jam 00:00 (atau trigger command manual) | Perhitungan transaksi `created_at` hari sebelumnya tidak lagi mengurangi `sisa_limit` siswa hari ini |

---

## 7. Modul Monitoring Orang Tua

| ID | Skenario | Langkah Pengujian | Ekspektasi Hasil |
|---|---|---|---|
| ORT-01 | Lihat Histori Anak Sendiri | 1. Ortu login<br>2. Buka dashboard | Menampilkan sisa saldo anak, limit hari ini, dan histori jajan yang update real-time |
| ORT-02 | Keamanan Data Anak Lain | 1. Ortu mencoba memanipulasi parameter URL (contoh: /api/siswa/99/histori) | Response 403 Unauthorized (Hanya bisa akses `siswa_id` yang terhubung ke akunnya) |
