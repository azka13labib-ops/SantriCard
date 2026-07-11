# Error Codes & Response Format — SantriCard

---

## Format Response Standar

### Berhasil

```json
{
  "success": true,
  "message": "Transaksi berhasil",
  "data": { ... }
}
```

### Gagal

```json
{
  "success": false,
  "message": "Limit harian habis",
  "error_code": "LIMIT_EXCEEDED",
  "data": null
}
```

---

## Daftar Error Code

| Error Code | HTTP Status | Keterangan |
|-----------|-------------|-----------|
| `UNAUTHENTICATED` | 401 | Token tidak ada / expired |
| `UNAUTHORIZED` | 403 | Role tidak punya akses |
| `SISWA_NOT_FOUND` | 404 | Siswa tidak ditemukan |
| `KARTU_NOT_FOUND` | 404 | Kode kartu tidak valid |
| `KARTU_INACTIVE` | 422 | Kartu sudah diblokir / direissue |
| `PEDAGANG_NOT_FOUND` | 404 | Pedagang tidak ditemukan |
| `PEDAGANG_INACTIVE` | 422 | Pedagang tidak aktif / tidak terdaftar |
| `SALDO_INSUFFICIENT` | 422 | Saldo siswa tidak cukup |
| `LIMIT_EXCEEDED` | 422 | Limit harian sudah habis |
| `SISWA_INACTIVE` | 422 | Akun siswa dinonaktifkan |
| `VALIDATION_ERROR` | 422 | Input tidak valid |
| `SERVER_ERROR` | 500 | Error internal server |

---

## Contoh Response Per Skenario

### Pedagang tidak aktif
```json
{
  "success": false,
  "message": "Pedagang tidak terdaftar atau tidak aktif",
  "error_code": "PEDAGANG_INACTIVE"
}
```

### Saldo tidak cukup
```json
{
  "success": false,
  "message": "Saldo siswa tidak cukup",
  "error_code": "SALDO_INSUFFICIENT",
  "data": {
    "saldo_tersedia": 5000,
    "nominal_diminta": 15000
  }
}
```

### Limit harian habis
```json
{
  "success": false,
  "message": "Limit harian sudah habis",
  "error_code": "LIMIT_EXCEEDED",
  "data": {
    "sisa_limit": 3000,
    "nominal_diminta": 15000,
    "reset_pukul": "00:00"
  }
}
``` 