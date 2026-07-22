<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreMerchantRequest;
use App\Http\Requests\UpdateMerchantRequest;
use App\Models\User;
use App\Models\Merchant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class MerchantController extends Controller
{
    public function index()
    {
        $merchants = Merchant::with('user:id,name,email')->paginate(25);
        return response()->json($merchants);
    }

    public function store(StoreMerchantRequest $request)
    {
        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'merchant'
            ]);

            $merchant = Merchant::create([
                'user_id' => $user->id,
                'nama_kantin' => $request->nama_kantin,
                'lokasi' => $request->lokasi,
                'saldo_mengendap' => 0
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Merchant berhasil ditambahkan',
                'data' => $merchant->load('user:id,name,email')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('MerchantController@store failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menambah merchant. Silakan coba lagi.'], 500);
        }
    }

    public function show(string $id)
    {
        $merchant = Merchant::with('user:id,name,email')->findOrFail($id);
        return response()->json($merchant);
    }

    public function update(UpdateMerchantRequest $request, string $id)
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update($request->only('nama_kantin', 'lokasi'));

        return response()->json(['message' => 'Profil kantin berhasil diupdate', 'data' => $merchant]);
    }

    public function penjualan(string $id)
    {
        $user = request()->user();

        // Merchant hanya boleh melihat data penjualannya sendiri.
        // ID dari URL diabaikan untuk role merchant — selalu gunakan merchant milik user login.
        if ($user->role === 'merchant') {
            $merchant = $user->merchant;
            if (!$merchant) {
                return response()->json(['message' => 'Akun merchant tidak ditemukan.'], 404);
            }
        } else {
            // Admin boleh mengakses berdasarkan ID dari URL
            $merchant = Merchant::findOrFail($id);
        }
        
        $transactions = $merchant->transactions()->with('student:id,nama')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->paginate(25);
            
        $totalPenjualanBulanIni = $merchant->transactions()
            ->where('created_at', '>=', now()->subDays(30))
            ->where('status', 'berhasil')
            ->sum('nominal');

        return response()->json([
            'merchant' => $merchant->nama_kantin,
            'saldo_mengendap' => $merchant->saldo_mengendap,
            'total_penjualan_30_hari' => $totalPenjualanBulanIni,
            'histori_transaksi' => $transactions
        ]);
    }

    public function verifikasi(Request $request, string $id)
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->terverifikasi = !$merchant->terverifikasi;
        $merchant->save();

        $status = $merchant->terverifikasi ? 'diverifikasi' : 'dibatalkan verifikasinya';

        return response()->json([
            'message' => "Merchant berhasil {$status}",
            'data' => $merchant
        ]);
    }
}
