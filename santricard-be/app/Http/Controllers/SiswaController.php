<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Siswa;
use App\Models\Kartu;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SiswaController extends Controller
{
    public function index()
    {
        $siswas = Siswa::with('ortu', 'kartu')->get();
        return response()->json($siswas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ortu_id' => 'required|exists:users,id',
            'nis' => 'required|digits:10|unique:siswas',
            'nama' => 'required|string',
            'kelas' => 'required|string',
            'limit_harian' => 'required|numeric|min:500|max:20000'
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $siswa = Siswa::create([
                'ortu_id' => $request->ortu_id,
                'nis' => $request->nis,
                'nama' => $request->nama,
                'kelas' => $request->kelas,
                'saldo_virtual' => 0,
                'limit_harian' => $request->limit_harian,
                'aktif' => true,
            ]);

            // Generate Kartu — menggunakan UUID v4 untuk kriptografis acak
            $uid_rfid = Str::random(10); // Dummy RFID for now if no scanner
            $qr_code_hash = (string) Str::uuid(); // UUID v4, cryptographically random

            Kartu::create([
                'siswa_id' => $siswa->id,
                'uid_rfid' => $uid_rfid,
                'qr_code_hash' => $qr_code_hash,
                'status_aktif' => true,
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['message' => 'Siswa berhasil ditambahkan', 'data' => $siswa->load('kartu')], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            Log::error('SiswaController@store failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menambah siswa. Silakan coba lagi.'], 500);
        }
    }

    public function show(Request $request, string $id)
    {
        $siswa = Siswa::with('ortu:id,name,email', 'kartu:id,siswa_id,status_aktif')->findOrFail($id);

        if ($request->user()->role === 'ortu' && $siswa->ortu_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: Anda tidak berhak mengakses data siswa ini'], 403);
        }

        return response()->json($siswa);
    }

    public function update(Request $request, string $id)
    {
        $siswa = Siswa::findOrFail($id);
        
        $request->validate([
            'nama' => 'sometimes|string',
            'kelas' => 'sometimes|string',
            'limit_harian' => 'sometimes|numeric|min:500|max:20000'
        ]);

        $siswa->update($request->only('nama', 'kelas', 'limit_harian'));

        return response()->json(['message' => 'Siswa berhasil diupdate', 'data' => $siswa]);
    }

    public function destroy(string $id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->update(['aktif' => false]);
        
        if ($siswa->kartu) {
            $siswa->kartu->update(['status_aktif' => false]);
        }

        return response()->json(['message' => 'Siswa berhasil dinonaktifkan']);
    }

    public function saldo(Request $request, string $id)
    {
        $siswa = Siswa::findOrFail($id);

        if ($request->user()->role === 'ortu' && $siswa->ortu_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: Anda tidak berhak mengakses data siswa ini'], 403);
        }
        
        return response()->json([
            'siswa_id' => $siswa->id,
            'nama' => $siswa->nama,
            'saldo' => $siswa->saldo_virtual,
            'limit_harian' => $siswa->limit_harian,
            'sisa_limit' => $siswa->sisa_limit_hari_ini
        ]);
    }

    public function histori(Request $request, string $id)
    {
        $siswa = Siswa::findOrFail($id);

        if ($request->user()->role === 'ortu' && $siswa->ortu_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: Anda tidak berhak mengakses data siswa ini'], 403);
        }
        
        $transaksis = $siswa->transaksis()->with('pedagang:id,nama_kantin')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($transaksis);
    }
}
