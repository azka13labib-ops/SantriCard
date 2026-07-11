# Fitur: Transaksi — SantriCard

---

## Alur Validasi

Setiap POST `/api/transaksi` harus melalui 3 validasi berurutan:

```
[1] Pedagang aktif? → [2] Saldo cukup? → [3] Limit cukup? → Proses
```

---

## Contoh Kode: `TransaksiController.php`

```php
public function store(Request $request)
{
    $request->validate([
        'kode_kartu' => 'required|string',
        'nominal'    => 'required|numeric|min:500',
    ]);

    // Ambil pedagang dari token login
    $pedagang = $request->user()->pedagang;

    // [1] Validasi pedagang
    if (!$pedagang || !$pedagang->aktif) {
        return $this->tolak('Pedagang tidak aktif', 'PEDAGANG_INACTIVE');
    }

    // Cari kartu & siswa
    $kartu = Kartu::where('kode_unik', $request->kode_kartu)
                  ->where('aktif', true)
                  ->first();

    if (!$kartu) {
        return $this->tolak('Kartu tidak valid', 'KARTU_NOT_FOUND');
    }

    $siswa = $kartu->siswa;
    $nominal = $request->nominal;

    // [2] Validasi saldo
    if ($siswa->saldo < $nominal) {
        return $this->tolak('Saldo tidak cukup', 'SALDO_INSUFFICIENT', [
            'saldo_tersedia' => $siswa->saldo,
            'nominal_diminta' => $nominal,
        ]);
    }

    // [3] Validasi limit harian
    $terpakai = Transaksi::where('siswa_id', $siswa->id)
        ->whereDate('created_at', today())
        ->where('status', 'berhasil')
        ->sum('nominal');

    $sisaLimit = $siswa->limit_harian - $terpakai;

    if ($nominal > $sisaLimit) {
        return $this->tolak('Limit harian habis', 'LIMIT_EXCEEDED', [
            'sisa_limit' => $sisaLimit,
            'nominal_diminta' => $nominal,
        ]);
    }

    // Semua valid → Proses transaksi
    DB::transaction(function () use ($siswa, $pedagang, $nominal) {
        $siswa->decrement('saldo', $nominal);
        $pedagang->increment('saldo_virtual', $nominal);

        Transaksi::create([
            'siswa_id'    => $siswa->id,
            'pedagang_id' => $pedagang->id,
            'nominal'     => $nominal,
            'status'      => 'berhasil',
        ]);
    });

    return response()->json([
        'success' => true,
        'message' => 'Transaksi berhasil',
        'data' => [
            'nominal'    => $nominal,
            'sisa_saldo' => $siswa->fresh()->saldo,
            'sisa_limit' => $sisaLimit - $nominal,
            'siswa'      => $siswa->nama,
            'pedagang'   => $pedagang->nama,
        ]
    ]);
}

private function tolak(string $message, string $code, array $data = [])
{
    Transaksi::create([
        'siswa_id'       => $siswa->id ?? null,
        'pedagang_id'    => $pedagang->id ?? null,
        'nominal'        => $request->nominal ?? 0,
        'status'         => 'ditolak',
        'alasan_ditolak' => $message,
    ]);

    return response()->json([
        'success'    => false,
        'message'    => $message,
        'error_code' => $code,
        'data'       => $data ?: null,
    ], 422);
}
```

---

## Catatan Penting

- Gunakan `DB::transaction()` agar saldo siswa & saldo pedagang berubah secara atomik (tidak setengah-setengah jika server crash)
- Transaksi **yang ditolak tetap dicatat** ke tabel transaksi (untuk audit & transparansi orang tua)
- `kode_kartu` dikirim oleh kasir setelah scan QR — frontend yang handle scan, backend hanya terima string kode