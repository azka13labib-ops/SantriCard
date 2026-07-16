<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Merchant;
use App\Models\Settlement;
use Illuminate\Support\Facades\DB;

class SettlementController extends Controller
{
    public function index()
    {
        $settlements = Settlement::with('merchant:id,nama_kantin')->orderBy('created_at', 'desc')->get();
        return response()->json($settlements);
    }

    public function store(Request $request)
    {
        $request->validate([
            'merchant_id' => 'required|exists:merchants,id',
            'catatan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Lock merchant record
            $merchant = Merchant::where('id', $request->merchant_id)->lockForUpdate()->firstOrFail();
            
            if ($merchant->saldo_mengendap <= 0) {
                DB::rollBack();
                return response()->json(['message' => 'Tidak ada saldo yang bisa dicairkan'], 400);
            }

            $nominalDicairkan = $merchant->saldo_mengendap;

            // Catat settlement
            $settlement = Settlement::create([
                'merchant_id' => $merchant->id,
                'nominal' => $nominalDicairkan,
                'catatan' => $request->catatan,
                'status' => 'berhasil'
            ]);

            // Nolkan saldo mengendap
            $merchant->saldo_mengendap = 0;
            $merchant->save();

            DB::commit();

            return response()->json([
                'message' => 'Pencairan dana berhasil',
                'data' => $settlement
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal melakukan pencairan', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        $settlement = Settlement::with('merchant:id,nama_kantin')->findOrFail($id);
        return response()->json($settlement);
    }
}
