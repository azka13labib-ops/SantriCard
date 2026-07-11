# Scheduler & Reset Limit — SantriCard

Fitur pembatasan pengeluaran (Limit Harian) mengharuskan sistem untuk "me-reset" atau menghitung ulang batas pengeluaran anak setiap hari pada pukul 00:00.

Di SantriCard, kita **TIDAK** menggunakan kolom `sisa_limit` yang dikurangi secara harfiah lalu di-reset tiap malam, karena itu rawan bug jika cron job gagal berjalan.
Kita menggunakan pendekatan **Perhitungan On-The-Fly (Real-time)**.

---

## 1. Pendekatan Perhitungan Limit

Daripada menyimpan `sisa_limit` di database, kita menyimpan **Total Transaksi Hari Ini** berdasarkan kolom `created_at` pada tabel `transaksi`.

**Rumus Sisa Limit:**
`Sisa Limit = Limit Harian Siswa - SUM(Nominal Transaksi Hari Ini)`

```php
// Query di TransaksiController saat siswa jajan:
$terpakaiHariIni = Transaksi::where('siswa_id', $siswa->id)
    ->whereDate('created_at', today()) // Hanya transaksi hari ini
    ->where('status', 'berhasil')
    ->sum('nominal');

$sisaLimit = $siswa->limit_harian - $terpakaiHariIni;

if ($nominal_baru > $sisaLimit) {
    // Tolak transaksi
}
```

Dengan cara ini, saat waktu server berganti dari `23:59:59` ke `00:00:00`, secara otomatis perhitungan limit terganti karena `today()` sudah berbeda, **tanpa perlu menjalankan script apapun!**

---

## 2. Kapan Kita Butuh Scheduler (Cron Job)?

Meski perhitungan limit berjalan otomatis (real-time), Anda tetap membutuhkan Scheduler untuk fungsi-fungsi *maintenance* lainnya di masa depan, seperti:
- Mengirim rekap transaksi harian via email ke Admin/Orang Tua (misal: pukul 21:00).
- Mem-backup database mingguan.
- Menghapus token login (Sanctum) yang sudah *expired* dan menumpuk di database.

### Cara Setup Scheduler di Laravel

1. Daftarkan perintah di `app/Console/Kernel.php` (Laravel 10) atau `routes/console.php` (Laravel 11+).
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Contoh membersihkan token yang sudah expired tiap malam
    $schedule->command('sanctum:prune-expired --hours=24')->dailyAt('02:00');
}
```

2. Tambahkan Cron Job di Server (Linux/VPS)
```bash
* * * * * cd /path-ke-project/santricard-api && php artisan schedule:run >> /dev/null 2>&1
```

*(Karena proyek ini akan dijalankan secara LOKAL, maka poin nomor 2 bisa dilewati, kecuali Anda menggunakan fitur email/backup di lingkungan lokal Anda).*
