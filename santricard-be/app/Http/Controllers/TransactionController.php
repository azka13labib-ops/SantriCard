<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreTransactionRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Card;
use App\Models\Student;
use App\Models\Merchant;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['student:id,nama', 'merchant:id,nama_kantin'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);
        return response()->json($transactions);
    }

    public function store(StoreTransactionRequest $request)
    {
        $pedagangId = $request->user()->merchant->id ?? null;
        if (!$pedagangId) {
            return response()->json(['message' => 'Anda bukan merchant'], 403);
        }

        // ── Fix #6: Idempotency check — cegah transaction double saat retry ──
        if ($request->filled('idempotency_key')) {
            $existing = Transaction::where('idempotency_key', $request->idempotency_key)->first();
            if ($existing) {
                return response()->json([
                    'status' => 'berhasil',
                    'message' => 'Transaction sudah diproses sebelumnya (idempotent).',
                    'transaction_id' => $existing->id,
                    'nominal' => $existing->nominal,
                ]);
            }
        }

        DB::beginTransaction();
        try {
            // Lock merchant record
            $merchant = Merchant::where('id', $pedagangId)->lockForUpdate()->first();

            // ── Fix #15: Cek apakah merchant sudah diverifikasi admin ──
            if (!$merchant->terverifikasi) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Akun kantin Anda belum diverifikasi oleh Admin. Hubungi admin sekolah.'
                ], 403);
            }

            // Cari card
            $card = Card::where('uid_rfid', $request->kode_kartu)
                ->orWhere('qr_code_hash', $request->kode_kartu)
                ->first();

            if (!$card || !$card->status_aktif) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Card tidak valid atau tidak aktif'
                ], 400);
            }

            // Lock student record
            $student = Student::where('id', $card->student_id)->lockForUpdate()->first();

            if (!$student || !$student->aktif) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Student tidak aktif'
                ], 400);
            }

            if ($student->saldo_virtual < $request->nominal) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Saldo tidak cukup',
                    'sisa_saldo' => $student->saldo_virtual
                ], 400);
            }

            if ($student->getSisaLimitHariIniAttribute() < $request->nominal) {
                DB::rollBack();
                return response()->json([
                    'status' => 'ditolak',
                    'alasan' => 'Limit harian habis atau tidak mencukupi',
                    'sisa_limit' => $student->getSisaLimitHariIniAttribute(),
                    'nominal_diminta' => $request->nominal
                ], 400);
            }

            // Potong saldo student
            $student->saldo_virtual -= $request->nominal;
            $student->save();

            // Tambah saldo merchant
            $merchant->saldo_mengendap += $request->nominal;
            $merchant->save();

            // Catat transaction (dengan idempotency_key jika ada)
            $transaction = Transaction::create([
                'idempotency_key' => $request->idempotency_key ?: null,
                'student_id' => $student->id,
                'merchant_id' => $merchant->id,
                'nominal' => $request->nominal,
                'status' => 'berhasil'
            ]);

            DB::commit();

            return response()->json([
                'status' => 'berhasil',
                'transaction_id' => $transaction->id,
                'nominal' => $transaction->nominal,
                'sisa_saldo' => $student->saldo_virtual,
                'sisa_limit' => $student->getSisaLimitHariIniAttribute(),
                'student' => $student->nama,
                'merchant' => $merchant->nama_kantin
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('TransactionController@store failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'gagal',
                'alasan' => 'Terjadi kesalahan sistem. Silakan coba lagi.'
            ], 500);
        }
    }
}
