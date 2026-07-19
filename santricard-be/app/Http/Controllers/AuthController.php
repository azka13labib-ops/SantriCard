<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $isEmail = str_contains($identifier, '@');

        if (!$isEmail) {
            // NISN login
            $student = \App\Models\Student::where('nis', $identifier)->first();
            if (!$student || !$student->parent_id) {
                return response()->json(['message' => 'NISN tidak ditemukan atau tidak memiliki akun orang tua terkait.'], 401);
            }

            $user = \App\Models\User::find($student->parent_id);
            if (!$user) {
                return response()->json(['message' => 'Akun orang tua tidak ditemukan.'], 401);
            }

            // P1-C: Blokir user yang dinonaktifkan admin
            if (!$user->aktif) {
                return response()->json(['message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.'], 403);
            }

            // Jika sudah setup akun, NISN hanya boleh login jika ada password
            if (!$user->perlu_setup_akun) {
                // Jika tidak ada password sama sekali → arahkan ke email/password
                if (!$request->filled('password')) {
                    return response()->json(['message' => 'Silakan login menggunakan email dan password.'], 401);
                }
                // Ada password → verifikasi
                if (!\Illuminate\Support\Facades\Auth::attempt(['email' => $user->email, 'password' => $request->password])) {
                    return response()->json([
                        'message' => 'NISN atau password salah.'
                    ], 401);
                }
            }
        } else {
            // Email login
            $request->validate([
                'password' => 'required',
            ]);

            if (!\Illuminate\Support\Facades\Auth::attempt(['email' => $identifier, 'password' => $request->password])) {
                return response()->json([
                    'message' => 'Email atau password salah.'
                ], 401);
            }

            $user = \App\Models\User::where('email', $identifier)->firstOrFail();

            // P1-C: Blokir user yang dinonaktifkan admin
            if (!$user->aktif) {
                return response()->json(['message' => 'Akun Anda telah dinonaktifkan. Hubungi administrator.'], 403);
            }
            
            if ($user->role === 'parent' && $user->perlu_setup_akun) {
                return response()->json(['message' => 'Akun belum diaktifkan, silakan login menggunakan NISN anak terlebih dahulu.'], 401);
            }
        }
        
        // SEC-04: Revoke semua token lama sebelum membuat token baru
        // Ini memastikan hanya satu sesi aktif per login
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'perlu_setup_akun' => $user->perlu_setup_akun,
            ]
        ]);
    }

    public function setupPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6'
        ]);

        $user = $request->user();
        if ($user->role !== 'parent') {
            return response()->json(['message' => 'Hanya orang tua yang dapat melakukan aksi ini.'], 403);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'perlu_setup_akun' => false
        ]);

        return response()->json(['message' => 'Password berhasil diatur. Silakan gunakan email dan password untuk login selanjutnya.']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email'            => 'required|email|unique:users,email,' . $user->id,
            // P2-D: Wajib konfirmasi password lama saat ingin ganti password
            'current_password' => $request->filled('password') ? 'required' : 'nullable',
            'password'         => 'nullable|min:6',
        ]);

        // P2-D: Verifikasi password lama sebelum mengganti password baru
        if ($request->filled('password')) {
            if (!$request->filled('current_password') || !\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Password saat ini tidak sesuai.'], 422);
            }
        }

        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
