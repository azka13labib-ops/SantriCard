<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Pedagang;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PedagangController extends Controller
{
    public function index()
    {
        $pedagangs = Pedagang::with('user:id,name,email')->get();
        return response()->json($pedagangs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'nama_kantin' => 'required|string',
            'lokasi' => 'required|string'
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'pedagang'
            ]);

            $pedagang = Pedagang::create([
                'user_id' => $user->id,
                'nama_kantin' => $request->nama_kantin,
                'lokasi' => $request->lokasi,
                'saldo_mengendap' => 0
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pedagang berhasil ditambahkan',
                'data' => $pedagang->load('user:id,name,email')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PedagangController@store failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menambah pedagang. Silakan coba lagi.'], 500);
        }
    }

    public function show(string $id)
    {
        $pedagang = Pedagang::with('user:id,name,email')->findOrFail($id);
        return response()->json($pedagang);
    }

    public function update(Request $request, string $id)
    {
        $pedagang = Pedagang::findOrFail($id);
        
        $request->validate([
            'nama_kantin' => 'sometimes|string',
            'lokasi' => 'sometimes|string'
        ]);

        $pedagang->update($request->only('nama_kantin', 'lokasi'));

        return response()->json(['message' => 'Profil kantin berhasil diupdate', 'data' => $pedagang]);
    }

    public function penjualan(string $id)
    {
        $pedagang = Pedagang::findOrFail($id);
        
        $transaksis = $pedagang->transaksis()->with('siswa:id,nama')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->get();
            
        $totalPenjualanBulanIni = $transaksis->where('status', 'berhasil')->sum('nominal');

        return response()->json([
            'pedagang' => $pedagang->nama_kantin,
            'saldo_mengendap' => $pedagang->saldo_mengendap,
            'total_penjualan_30_hari' => $totalPenjualanBulanIni,
            'histori_transaksi' => $transaksis
        ]);
    }
}
