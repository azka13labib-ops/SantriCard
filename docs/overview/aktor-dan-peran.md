# Aktor & Peran — SantriCard

---

## 1. Admin Pondok

**Siapa:** Staf pondok yang tech-literate, bisa 1-2 orang.

**Bisa apa di sistem:**
- Tambah / edit / nonaktifkan data siswa
- Generate & reissue kartu siswa
- Top-up saldo siswa
- Daftarkan & verifikasi pedagang mitra
- Nonaktifkan pedagang jika bermasalah
- Lihat dashboard transaksi harian
- Lakukan settlement (cairkan dana pedagang)
- Export laporan jika diperlukan

**Login via:** Dashboard admin web (role: `admin`)

---

## 2. Siswa

**Siapa:** Santri/siswa pondok yang punya kartu.

**Tidak punya akun di sistem** — siswa hanya memegang kartu fisik (QR/barcode). Kartu itulah yang dipakai untuk transaksi.

**Yang perlu diketahui siswa:**
- Bawa kartu setiap kali mau belanja
- Limit belanja Rp 20.000/hari
- Kalau limit habis, harus tunggu besok atau minta orang tua top-up
- Kalau kartu hilang, lapor ke admin untuk reissue

---

## 3. Kasir / Pedagang Mitra

**Siapa:** Pedagang yang jualan di sekitar/keliling pondok dan sudah didaftarkan oleh admin.

**Bisa apa di sistem:**
- Login ke aplikasi kasir (web atau PWA di HP)
- Scan QR kartu siswa
- Input nominal transaksi
- Lihat total penjualan hari ini / minggu ini
- Lihat histori transaksi sendiri

**Login via:** Halaman kasir web (role: `pedagang`)

**Yang perlu diketahui:**
- Hanya bisa menerima kartu siswa yang saldo & limitnya cukup
- Tidak bisa manipulasi nominal — nominal diinput kasir, server yang validasi
- Jika status akun dinonaktifkan admin → tidak bisa menerima transaksi apapun

---

## 4. Orang Tua

**Siapa:** Wali/orang tua siswa yang tinggal jauh dari pondok.

**Bisa apa di sistem:**
- Login ke halaman monitoring
- Lihat saldo anak saat ini
- Lihat sisa limit harian anak (contoh: Rp 8.000 / Rp 20.000)
- Lihat histori transaksi 30 hari terakhir
- Lihat nama pedagang di setiap transaksi

**Login via:** Halaman parent web (role: `ortu`)

**Yang tidak bisa dilakukan:**
- Tidak bisa top-up sendiri (harus lewat admin)
- Tidak bisa ubah limit
- Tidak bisa lihat data siswa lain

---

## 5. Guru / Mentor (Opsional)

**Siapa:** Guru pengawas atau mentor yang ingin monitor secara keseluruhan.

**Bisa apa di sistem (jika diaktifkan):**
- Lihat laporan transaksi semua siswa
- Lihat daftar pedagang aktif
- Tidak bisa ubah data apapun

**Login via:** Dashboard admin (role: `guru`, read-only)

---

## Ringkasan Role & Akses

| Role | Transaksi | Top-Up | Kelola Siswa | Kelola Pedagang | Settlement | Monitoring |
|------|-----------|--------|-------------|----------------|-----------|-----------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pedagang | ✓ (scan) | ✗ | ✗ | ✗ | ✗ | Milik sendiri |
| Orang Tua | ✗ | ✗ | ✗ | ✗ | ✗ | Anak sendiri |
| Guru | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (semua) |
| Siswa | (pakai kartu) | ✗ | ✗ | ✗ | ✗ | ✗ |