<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Merchant;
use App\Models\Settlement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

            // Catat settlement dengan actor admin (SEC-09)
            $settlement = Settlement::create([
                'merchant_id'  => $merchant->id,
                'nominal'      => $nominalDicairkan,
                'catatan'      => $request->catatan,
                'status'       => 'berhasil',
                'processed_by' => $request->user()->id,
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
            // SEC-11: Hanya log detail ke server, jangan bocorkan ke client
            Log::error('SettlementController@store failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal melakukan pencairan. Silakan coba lagi.'], 500);
        }
    }

    public function show(string $id)
    {
        $settlement = Settlement::with('merchant:id,nama_kantin')->findOrFail($id);
        return response()->json($settlement);
    }
}
