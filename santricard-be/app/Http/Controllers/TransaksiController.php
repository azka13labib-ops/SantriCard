<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            ->paginate(25);
        return response()->json($transaksis);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_kartu' => 'required|string',
            'nominal' => 'required|numeric|min:500|max:20000',
            'idempotency_key' => 'nullable|string|max:50',
        ]);

        $pedagangId = $request->user()->pedagang->id ?? null;
        if (!$pedagangId) {
            return response()->json(['message' => 'Anda bukan pedagang'], 403);
        }

        // ── Fix #6: Idempotency check — cegah transaksi double saat retry ──
        if ($request->filled('idempotency_key')) {
            $existing = Transaksi::where('idempotency_key', $request->idempotency_key)->first();
            if ($existing) {
                return response()->json([
                    'status' => 'berhasil',
                    'message' => 'Transaksi sudah diproses sebelumnya (idempotent).',
                    'transaksi_id' => $existing->id,
                    'nominal' => $existing->nominal,
                ]);
            }
        }

        DB::beginTransaction();
        try {
            // Lock pedagang record
            $pedagang = Pedagang::where('id', $pedagangId)->lockForUpdate()->first();

            // ── Fix #15: Cek apakah pedagang sudah diverifikasi admin ──
            if (!$pedagang->terverifikasi) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Akun kantin Anda belum diverifikasi oleh Admin. Hubungi admin sekolah.'
                ], 403);
            }

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

            if ($siswa->getSisaLimitHariIniAttribute() < $request->nominal) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Limit harian habis atau tidak mencukupi',
                    'sisa_limit' => $siswa->getSisaLimitHariIniAttribute(),
                    'nominal_diminta' => $request->nominal
                ], 400);
            }

            // Potong saldo siswa
            $siswa->saldo_virtual -= $request->nominal;
            $siswa->save();

            // Tambah saldo pedagang
            $pedagang->saldo_mengendap += $request->nominal;
            $pedagang->save();

            // Catat transaksi (dengan idempotency_key jika ada)
            $transaksi = Transaksi::create([
                'idempotency_key' => $request->idempotency_key ?: null,
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
                'sisa_limit' => $siswa->getSisaLimitHariIniAttribute(),
                'siswa' => $siswa->nama,
                'pedagang' => $pedagang->nama_kantin
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('TransaksiController@store failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'gagal',
                'alasan' => 'Terjadi kesalahan sistem. Silakan coba lagi.'
            ], 500);
        }
    }
}
