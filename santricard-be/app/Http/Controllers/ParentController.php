<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ParentController extends Controller
{
    public function index()
    {
        $parents = User::where('role', 'parent')->withCount('students')->get();
        return response()->json($parents);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users'
        ]);

        $parent = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make('santricard2026'),
            'role' => 'parent',
            'perlu_setup_akun' => true,
        ]);

        return response()->json(['message' => 'Orang tua berhasil ditambahkan', 'data' => $parent], 201);
    }

    public function update(Request $request, string $id)
    {
        $parent = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $parent->id
        ]);

        $data = $request->only('name', 'email');

        $parent->update($data);

        return response()->json(['message' => 'Data orang tua berhasil diupdate', 'data' => $parent]);
    }

    public function students(string $id)
    {
        $parent = User::where('id', $id)->where('role', 'parent')->firstOrFail();
        $students = $parent->students()->with('card:id,student_id,status_aktif')->get();
        return response()->json($students);
    }

    public function resetPassword(string $id)
    {
        $parent = User::where('id', $id)->where('role', 'parent')->firstOrFail();
        $parent->update([
            'password' => Hash::make('santricard2026'),
            'perlu_setup_akun' => true,
        ]);

        return response()->json(['message' => 'Password orang tua berhasil direset.']);
    }

    public function destroy(string $id)
    {
        $parent = User::findOrFail($id);
        
        // Cek apakah punya student aktif
        if ($parent->students()->where('aktif', true)->exists()) {
            return response()->json(['message' => 'Gagal menghapus! Orang tua ini masih terikat dengan data student aktif.'], 400);
        }

        $parent->delete();

        return response()->json(['message' => 'Orang tua berhasil dihapus']);
    }
}
