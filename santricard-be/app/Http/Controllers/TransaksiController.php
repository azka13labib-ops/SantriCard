<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_kartu' => 'required',
            'nominal' => 'required|numeric|min:1',
        ]);

        $pedagang = $request->user()->pedagang;
        if (!$pedagang) {
            return response()->json(['message' => 'Anda bukan pedagang'], 403);
        }

        // Cari kartu
        $kartu = \App\Models\Kartu::where('uid_rfid', $request->kode_kartu)
            ->orWhere('qr_code_hash', $request->kode_kartu)
            ->first();

        if (!$kartu || !$kartu->status_aktif) {
            return response()->json([
                'status' => 'ditolak',
                'alasan' => 'Kartu tidak valid atau tidak aktif'
            ], 400);
        }

        $siswa = $kartu->siswa;

        if (!$siswa->aktif) {
            return response()->json([
                'status' => 'ditolak',
                'alasan' => 'Siswa tidak aktif'
            ], 400);
        }

        if ($siswa->saldo_virtual < $request->nominal) {
            return response()->json([
                'status' => 'ditolak',
                'alasan' => 'Saldo tidak cukup',
                'sisa_saldo' => $siswa->saldo_virtual
            ], 400);
        }

        if ($siswa->sisa_limit_hari_ini < $request->nominal) {
            return response()->json([
                'status' => 'ditolak',
                'alasan' => 'Limit harian habis atau tidak mencukupi',
                'sisa_limit' => $siswa->sisa_limit_hari_ini,
                'nominal_diminta' => $request->nominal
            ], 400);
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // Potong saldo siswa
            $siswa->saldo_virtual -= $request->nominal;
            $siswa->save();

            // Tambah saldo pedagang
            $pedagang->saldo_mengendap += $request->nominal;
            $pedagang->save();

            // Catat transaksi
            $transaksi = \App\Models\Transaksi::create([
                'siswa_id' => $siswa->id,
                'pedagang_id' => $pedagang->id,
                'nominal' => $request->nominal,
                'status' => 'berhasil'
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'status' => 'berhasil',
                'transaksi_id' => $transaksi->id,
                'nominal' => $transaksi->nominal,
                'sisa_saldo' => $siswa->saldo_virtual,
                'sisa_limit' => $siswa->sisa_limit_hari_ini,
                'siswa' => $siswa->nama,
                'pedagang' => $pedagang->nama_kantin
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'status' => 'gagal',
                'alasan' => 'Terjadi kesalahan sistem'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
