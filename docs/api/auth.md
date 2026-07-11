# Auth & Authorization — SantriCard

---

## Library yang Dipakai

**Laravel Sanctum** — untuk token-based API auth.

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

---

## Role di Sistem

| Role | Deskripsi |
|------|-----------|
| `admin` | Akses penuh ke semua fitur |
| `pedagang` | Hanya bisa scan kartu & lihat penjualan sendiri |
| `ortu` | Hanya bisa lihat data anak sendiri |
| `guru` | Read-only ke semua data (opsional) |

---

## Cara Kerja Auth

1. User `POST /api/auth/login` → dapat Bearer Token
2. Semua request berikutnya kirim header: `Authorization: Bearer {token}`
3. Middleware cek token & role sebelum izinkan akses endpoint

---

## Middleware Role di Laravel

```php
// app/Http/Middleware/CheckRole.php
public function handle(Request $request, Closure $next, ...$roles)
{
    if (!in_array($request->user()->role, $roles)) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    return $next($request);
}
```

Pakai di route:

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/siswa', [SiswaController::class, 'store']);
    Route::post('/siswa/{id}/topup', [TopupController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:pedagang'])->group(function () {
    Route::post('/transaksi', [TransaksiController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:admin,ortu'])->group(function () {
    Route::get('/siswa/{id}/histori', [SiswaController::class, 'histori']);
});
```