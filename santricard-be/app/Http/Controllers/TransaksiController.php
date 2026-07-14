<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Kartu;
use App\Models\Siswa;
use App\Models\Pedagang;
use App\Models\Transaksi;

class TransaksiController extends Controller
{
    public function index()
    {
        $transaksis = Transaksi::with(['siswa:id,nama', 'pedagang:id,nama_kantin'])
            ->orderBy('created_at', 'desc')
            ->limit(100) // Batasi 100 terakhir agar tidak berat. Aslinya butuh pagination.
            ->get();
        return response()->json($transaksis);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_kartu' => 'required',
            'nominal' => 'required|numeric|min:500|max:20000',
        ]);

        $pedagangId = $request->user()->pedagang->id ?? null;
        if (!$pedagangId) {
            return response()->json(['message' => 'Anda bukan pedagang'], 403);
        }

        DB::beginTransaction();
        try {
            // Lock pedagang record
            $pedagang = Pedagang::where('id', $pedagangId)->lockForUpdate()->first();

            // Cari kartu
            $kartu = Kartu::where('uid_rfid', $request->kode_kartu)
                ->orWhere('qr_code_hash', $request->kode_kartu)
                ->first();

            if (!$kartu || !$kartu->status_aktif) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Kartu tidak valid atau tidak aktif'
                ], 400);
            }

            // Lock siswa record
            $siswa = Siswa::where('id', $kartu->siswa_id)->lockForUpdate()->first();

            if (!$siswa || !$siswa->aktif) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Siswa tidak aktif'
                ], 400);
            }

            if ($siswa->saldo_virtual < $request->nominal) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Saldo tidak cukup',
                    'sisa_saldo' => $siswa->saldo_virtual
                ], 400);
            }

            if ($siswa->sisa_limit_hari_ini < $request->nominal) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Limit harian habis atau tidak mencukupi',
                    'sisa_limit' => $siswa->sisa_limit_hari_ini,
                    'nominal_diminta' => $request->nominal
                ], 400);
            }

            // Potong saldo siswa
            $siswa->saldo_virtual -= $request->nominal;
            $siswa->save();

            // Tambah saldo pedagang
            $pedagang->saldo_mengendap += $request->nominal;
            $pedagang->save();

            // Catat transaksi
            $transaksi = Transaksi::create([
                'siswa_id' => $siswa->id,
                'pedagang_id' => $pedagang->id,
                'nominal' => $request->nominal,
                'status' => 'berhasil'
            ]);

            DB::commit();

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
            DB::rollBack();
            return response()->json([
                'status' => 'gagal',
                'alasan' => 'Terjadi kesalahan sistem'
            ], 500);
        }
    }
}
