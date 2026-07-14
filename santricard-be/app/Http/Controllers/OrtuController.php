<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class OrtuController extends Controller
{
    public function index()
    {
        $ortus = User::where('role', 'ortu')->withCount('siswas')->get();
        return response()->json($ortus);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $ortu = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'ortu',
        ]);

        return response()->json(['message' => 'Orang tua berhasil ditambahkan', 'data' => $ortu], 201);
    }

    public function update(Request $request, string $id)
    {
        $ortu = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $ortu->id,
            'password' => 'sometimes|min:6'
        ]);

        $data = $request->only('name', 'email');
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $ortu->update($data);

        return response()->json(['message' => 'Data orang tua berhasil diupdate', 'data' => $ortu]);
    }

    public function destroy(string $id)
    {
        $ortu = User::findOrFail($id);
        
        // Cek apakah punya siswa aktif
        if ($ortu->siswas()->where('aktif', true)->exists()) {
            return response()->json(['message' => 'Gagal menghapus! Orang tua ini masih terikat dengan data siswa aktif.'], 400);
        }

        $ortu->delete();

        return response()->json(['message' => 'Orang tua berhasil dihapus']);
    }
}
