# Fitur Settlement (Pencairan Dana) — SantriCard

Setiap kali siswa berbelanja, saldo siswa akan berkurang, dan `saldo_virtual` pedagang akan bertambah. Fitur **Settlement** digunakan untuk mencairkan `saldo_virtual` tersebut menjadi uang fisik (cash atau transfer bank) untuk diberikan kepada pedagang.

---

## 1. Alur Kerja Settlement

1. **Admin Melihat Laporan**: Admin membuka halaman settlement, melihat daftar pedagang beserta jumlah `saldo_virtual` mereka saat ini.
2. **Pencairan Uang**: Admin menyerahkan uang tunai atau mentransfer uang dari rekening pondok ke rekening pedagang.
3. **Konfirmasi di Sistem**: Setelah uang diserahkan, Admin mengklik tombol "Cairkan" (Settlement) di dashboard.
4. **Sistem Memproses**: 
    - `saldo_virtual` pedagang tersebut akan di-reset menjadi 0 (atau dikurangi sesuai nominal pencairan).
    - Riwayat pencairan dicatat ke dalam tabel `settlement`.

---

## 2. Contoh Logika di Backend

```php
// Contoh di SettlementController@store
public function store(Request $request)
{
    $request->validate([
        'pedagang_id' => 'required|exists:pedagang,id',
        'catatan'     => 'nullable|string'
    ]);

    $pedagang = Pedagang::findOrFail($request->pedagang_id);
    $nominalCair = $pedagang->saldo_virtual;
    $admin = $request->user();

    if ($nominalCair <= 0) {
        return response()->json([
            'success' => false,
            'message' => 'Saldo pedagang kosong, tidak ada yang bisa dicairkan.'
        ], 422);
    }

    DB::transaction(function () use ($pedagang, $admin, $nominalCair, $request) {
        // 1. Catat ke tabel settlement
        Settlement::create([
            'pedagang_id' => $pedagang->id,
            'admin_id'    => $admin->id,
            'nominal'     => $nominalCair,
            'status'      => 'selesai',
            'catatan'     => $request->catatan,
        ]);

        // 2. Reset saldo virtual pedagang menjadi 0
        $pedagang->update([
            'saldo_virtual' => 0
        ]);
    });

    return response()->json([
        'success' => true,
        'message' => 'Settlement berhasil diproses. Saldo pedagang kini Rp 0.',
        'data'    => [
            'nominal_dicairkan' => $nominalCair
        ]
    ]);
}
```

---

## 3. Catatan Tambahan
- Biasanya dilakukan secara berkala (misal: seminggu sekali tiap hari Jumat).
- Sebaiknya ada fitur cetak struk (opsional) atau notifikasi WhatsApp ke pedagang bahwa dana telah cair.
