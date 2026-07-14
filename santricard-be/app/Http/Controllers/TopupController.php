<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\Topup;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TopupController extends Controller
{
    // ADMIN: Lihat semua pengajuan topup
    public function index()
    {
        $topups = Topup::with('siswa:id,nama,nis')->orderBy('created_at', 'desc')->get();
        return response()->json($topups);
    }

    // ORTU/ADMIN: Lihat histori topup untuk 1 siswa
    public function history(string $siswa_id)
    {
        $topups = Topup::where('siswa_id', $siswa_id)->orderBy('created_at', 'desc')->get();
        return response()->json($topups);
    }

    // ORTU/ADMIN: Ajukan atau langsung topup
    public function store(Request $request, string $siswa_id)
    {
        $request->validate([
            'nominal' => 'required|numeric|min:1',
            'metode' => 'required|string',
            'catatan' => 'nullable|string',
            'bukti_transfer' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120' // max 5MB
        ]);

        $user = $request->user();
        
        DB::beginTransaction();
        try {
            $siswa = Siswa::where('id', $siswa_id)->lockForUpdate()->firstOrFail();

            $status = 'pending';
            $path = null;

            if ($user->role === 'admin') {
                $status = 'berhasil';
                $siswa->saldo_virtual += $request->nominal;
                $siswa->save();
            } else {
                if ($request->hasFile('bukti_transfer')) {
                    $path = $request->file('bukti_transfer')->store('bukti_transfer', 'public');
                } else {
                    return response()->json(['message' => 'Bukti transfer wajib diunggah'], 400);
                }
            }

            $topup = Topup::create([
                'siswa_id' => $siswa->id,
                'nominal' => $request->nominal,
                'metode' => $request->metode,
                'catatan' => $request->catatan,
                'status' => $status,
                'bukti_transfer' => $path,
                'verified_by' => $user->role === 'admin' ? $user->id : null
            ]);

            DB::commit();

            return response()->json([
                'message' => $status === 'berhasil' ? 'Top-up berhasil' : 'Pengajuan top-up berhasil, menunggu verifikasi Admin.',
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

    // ADMIN: Verifikasi topup pending
    public function verifikasi(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:berhasil,gagal'
        ]);

        DB::beginTransaction();
        try {
            $topup = Topup::where('id', $id)->lockForUpdate()->firstOrFail();

            if ($topup->status !== 'pending') {
                return response()->json(['message' => 'Top-up sudah diverifikasi sebelumnya'], 400);
            }

            $topup->status = $request->status;
            $topup->verified_by = $request->user()->id;
            $topup->save();

            $siswa = Siswa::where('id', $topup->siswa_id)->lockForUpdate()->firstOrFail();

            if ($request->status === 'berhasil') {
                $siswa->saldo_virtual += $topup->nominal;
                $siswa->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Verifikasi top-up tersimpan',
                'data' => $topup
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memverifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
