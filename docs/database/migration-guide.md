# Migration Guide — Laravel

> Urutan migration penting! Tabel yang di-FK harus dibuat lebih dulu.

---

## Urutan Buat Migration

```
1. users
2. siswa
3. kartu
4. pedagang
5. transaksi
6. topup
7. settlement
```

---

## Contoh Migration: `create_siswa_table`

```php
Schema::create('siswa', function (Blueprint $table) {
    $table->id();
    $table->string('nama', 100);
    $table->string('kelas', 50)->nullable();
    $table->decimal('saldo', 10, 2)->default(0);
    $table->decimal('limit_harian', 10, 2)->default(20000);
    $table->foreignId('user_id_ortu')->constrained('users')->onDelete('cascade');
    $table->boolean('aktif')->default(true);
    $table->timestamps();
});
```

---

## Contoh Migration: `create_transaksi_table`

```php
Schema::create('transaksi', function (Blueprint $table) {
    $table->id();
    $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
    $table->foreignId('pedagang_id')->constrained('pedagang')->onDelete('cascade');
    $table->decimal('nominal', 10, 2);
    $table->enum('status', ['berhasil', 'ditolak']);
    $table->string('alasan_ditolak', 100)->nullable();
    $table->timestamps();

    // Index untuk query limit harian (performa)
    $table->index(['siswa_id', 'created_at']);
});
```

---

## Query Penting: Cek Limit Harian

```php
// Di TransaksiController
$totalHariIni = Transaksi::where('siswa_id', $siswaId)
    ->whereDate('created_at', today())
    ->where('status', 'berhasil')
    ->sum('nominal');

$sisaLimit = $siswa->limit_harian - $totalHariIni;

if ($nominal > $sisaLimit) {
    return response()->json([
        'status' => 'ditolak',
        'alasan' => 'Limit harian habis',
        'sisa_limit' => $sisaLimit,
    ], 422);
}
```

---

## Seeder (Data Dummy untuk Testing)

Buat seeder untuk:
- 1 akun admin
- 5 siswa dengan saldo awal Rp 100.000
- 3 pedagang aktif
- Beberapa transaksi contoh

```bash
php artisan db:seed --class=SantriCardSeeder
```