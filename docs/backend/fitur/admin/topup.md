# Fitur Top-Up Saldo (via QRIS DANA Bisnis) — SantriCard

Fitur ini digunakan oleh Admin untuk menambah saldo ke akun Siswa berdasarkan uang yang ditransfer oleh Orang Tua melalui **QRIS DANA Bisnis**. Karena kita menggunakan QRIS statis dari DANA Bisnis, proses verifikasi akhir tetap dilakukan oleh Admin.

---

## 1. Alur Kerja Top-Up

1. **Orang Tua Scan QRIS**: Orang tua login ke aplikasi monitoring, masuk ke halaman Top-Up. Sistem menampilkan gambar QRIS statis DANA Bisnis milik pondok. Orang tua melakukan scan dan transfer.
2. **Kirim Bukti (Opsional/Manual)**: Orang tua mengirimkan bukti transfer ke WhatsApp Admin (atau fitur upload bukti jika ada).
3. **Admin Verifikasi di DANA Bisnis**: Admin membuka aplikasi DANA Bisnis di HP-nya untuk memastikan uang benar-benar masuk.
4. **Admin Input di Sistem SantriCard**: 
    - Admin membuka dashboard SantriCard.
    - Mencari nama/ID siswa.
    - Menginput nominal top-up sesuai yang masuk di DANA.
    - Menambahkan catatan opsional (misal: "Top-up QRIS DANA 24 Okt").
5. **Sistem Memproses**: 
    - Saldo virtual siswa bertambah.
    - Riwayat top-up dicatat ke dalam tabel `topup`.
6. **Orang Tua Mengecek**: Orang tua bisa melihat penambahan saldo di aplikasi monitoring.

---

## 2. Contoh Logika di Backend

```php
// Contoh di TopupController@store
public function store(Request $request, $siswaId)
{
    $request->validate([
        'nominal' => 'required|numeric|min:1000',
        'catatan' => 'nullable|string'
    ]);

    $siswa = Siswa::findOrFail($siswaId);
    $admin = $request->user(); // Asumsi login sebagai admin

    DB::transaction(function () use ($siswa, $admin, $request) {
        // 1. Tambah saldo siswa
        $siswa->increment('saldo', $request->nominal);

        // 2. Catat ke histori topup
        Topup::create([
            'siswa_id' => $siswa->id,
            'admin_id' => $admin->id,
            'nominal'  => $request->nominal,
            'catatan'  => $request->catatan,
        ]);
    });

    return response()->json([
        'success' => true,
        'message' => 'Top-up berhasil!',
        'data'    => [
            'saldo_baru' => $siswa->fresh()->saldo
        ]
    ]);
}
```

---

## 3. Validasi Penting
- Hanya **Admin** yang memiliki wewenang untuk menembak endpoint ini (dilindungi middleware `role:admin`).
- Nominal top-up tidak boleh negatif atau nol.
- Wajib dibungkus dengan `DB::transaction()` untuk memastikan konsistensi data jika server tiba-tiba bermasalah.
