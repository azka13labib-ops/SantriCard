<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\Topup;
use Illuminate\Support\Facades\DB;

class TopupController extends Controller
{
    public function store(Request $request, $siswa_id)
    {
        $request->validate([
            'nominal' => 'required|numeric|min:1',
            'metode' => 'required|string', // misal: 'QRIS', 'Tunai'
            'catatan' => 'nullable|string'
        ]);

        $siswa = Siswa::findOrFail($siswa_id);

        DB::beginTransaction();
        try {
            // Tambah saldo
            $siswa->saldo_virtual += $request->nominal;
            $siswa->save();

            // Catat riwayat
            $topup = Topup::create([
                'siswa_id' => $siswa->id,
                'nominal' => $request->nominal,
                'metode' => $request->metode,
                'catatan' => $request->catatan,
                'status' => 'berhasil' // Asumsi langsung berhasil jika dari admin
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Top-up berhasil',
                'data' => $topup,
                'saldo_sekarang' => $siswa->saldo_virtual
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Top-up gagal',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
