# Manajemen Pedagang — SantriCard

Fitur ini digunakan oleh Admin untuk mendaftarkan dan mengelola pedagang mitra yang diperbolehkan menerima pembayaran dari SantriCard.

---

## 1. Alur Pendaftaran Pedagang

1. **Admin Input Data**: Admin memasukkan nama pedagang/warung, email, dan password sementara.
2. **Buat Akun User (`users`)**: Sistem otomatis membuatkan akun login dengan `role = pedagang`.
3. **Simpan Data Pedagang (`pedagang`)**: Sistem menyimpan profil pedagang dengan `saldo_virtual = 0` dan `aktif = true`.

```php
// Contoh Logika di PedagangController@store
public function store(Request $request)
{
    $request->validate([
        'nama'     => 'required|string',
        'email'    => 'required|email|unique:users,email',
        'password' => 'required|string|min:6'
    ]);

    DB::transaction(function () use ($request) {
        // Buat akun
        $user = User::create([
            'name'     => $request->nama,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'pedagang'
        ]);

        // Buat profil pedagang
        Pedagang::create([
            'user_id'       => $user->id,
            'nama'          => $request->nama,
            'saldo_virtual' => 0,
            'aktif'         => true
        ]);
    });

    return response()->json(['message' => 'Pedagang berhasil didaftarkan']);
}
```

---

## 2. Menonaktifkan Pedagang (Block)

Jika ada pedagang yang melanggar aturan atau sudah tidak bekerja sama, Admin bisa mengubah status `aktif = false`.

**Dampak jika `aktif = false`:**
- Pedagang masih bisa login untuk melihat histori transaksinya.
- Saat pedagang mencoba scan QR untuk menerima pembayaran, transaksi **akan ditolak** (Error Code: `PEDAGANG_INACTIVE`).

---

## 3. Saldo Virtual

Setiap transaksi yang berhasil, otomatis menambah saldo di kolom `saldo_virtual` pada tabel `pedagang`. Uang cash/fisiknya masih dipegang oleh pihak pondok.

*Untuk proses pencairan `saldo_virtual` menjadi uang tunai, lihat dokumen [Fitur Settlement](./settlement.md).*
