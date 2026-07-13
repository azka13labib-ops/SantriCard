<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pedagang;
use App\Models\Settlement;
use Illuminate\Support\Facades\DB;

class SettlementController extends Controller
{
    public function index()
    {
        $settlements = Settlement::with('pedagang:id,nama_kantin')->orderBy('created_at', 'desc')->get();
        return response()->json($settlements);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pedagang_id' => 'required|exists:pedagangs,id',
            'catatan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Lock pedagang record
            $pedagang = Pedagang::where('id', $request->pedagang_id)->lockForUpdate()->firstOrFail();
            
            if ($pedagang->saldo_mengendap <= 0) {
                DB::rollBack();
                return response()->json(['message' => 'Tidak ada saldo yang bisa dicairkan'], 400);
            }

            $nominalDicairkan = $pedagang->saldo_mengendap;

            // Catat settlement
            $settlement = Settlement::create([
                'pedagang_id' => $pedagang->id,
                'nominal' => $nominalDicairkan,
                'catatan' => $request->catatan,
                'status' => 'berhasil'
            ]);

            // Nolkan saldo mengendap
            $pedagang->saldo_mengendap = 0;
            $pedagang->save();

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
        $settlement = Settlement::with('pedagang:id,nama_kantin')->findOrFail($id);
        return response()->json($settlement);
    }
}
