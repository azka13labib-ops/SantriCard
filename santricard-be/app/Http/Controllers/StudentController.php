<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Requests\ImportStudentRequest;
use App\Models\Student;
use App\Models\Card;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with('parent:id,name,email', 'card:id,student_id,status_aktif')->paginate(25);
        return response()->json($students);
    }

    public function store(StoreStudentRequest $request)
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $student = Student::create([
                'parent_id' => $request->parent_id,
                'nis' => $request->nis,
                'nama' => $request->nama,
                'jenis_kelamin' => $request->jenis_kelamin,
                'kelas' => $request->kelas,
                'saldo_virtual' => 0,
                'limit_harian' => $request->limit_harian,
                'aktif' => true,
            ]);

            // Generate Card — menggunakan UUID v4 untuk kriptografis acak
            $uid_rfid = \Illuminate\Support\Str::random(10); // Dummy RFID for now if no scanner
            $qr_code_hash = (string) \Illuminate\Support\Str::uuid(); // UUID v4, cryptographically random

            \App\Models\Card::create([
                'student_id' => $student->id,
                'uid_rfid' => $uid_rfid,
                'qr_code_hash' => $qr_code_hash,
                'status_aktif' => true,
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['message' => 'Student berhasil ditambahkan', 'data' => $student->load('card')], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            Log::error('StudentController@store failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menambah student. Silakan coba lagi.'], 500);
        }
    }

    public function show(Request $request, string $id)
    {
        $student = Student::with('parent:id,name,email', 'card:id,student_id,status_aktif')->findOrFail($id);

        if ($request->user()->role === 'parent' && $student->parent_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: Anda tidak berhak mengakses data student ini'], 403);
        }

        return response()->json($student);
    }

    public function update(UpdateStudentRequest $request, string $id)
    {
        $student = Student::findOrFail($id);
        $student->update($request->only('nama', 'jenis_kelamin', 'kelas', 'limit_harian'));

        return response()->json(['message' => 'Student berhasil diupdate', 'data' => $student]);
    }

    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);

        \Illuminate\Support\Facades\DB::transaction(function () use ($student) {
            $parentId    = $student->parent_id;
            $hasHistory  = $student->transactions()->exists() || $student->top_ups()->exists();

            if (!$hasHistory) {
                // Hapus permanen jika belum ada riwayat (membantu admin saat salah import)
                if ($student->card) {
                    $student->card->delete();
                }
                $student->delete();
            } else {
                // Soft-delete (nonaktif) jika sudah ada riwayat transaksi
                $student->update(['aktif' => false]);

                if ($student->card) {
                    $student->card->update(['status_aktif' => false]);
                }
            }

            // CASCADE: Jika orang tua tidak punya anak lain → soft-delete orang tua juga
            if ($parentId) {
                $siblingsCount = Student::where('parent_id', $parentId)
                    ->where('id', '!=', $student->id)
                    ->count();

                if ($siblingsCount === 0) {
                    \App\Models\User::where('id', $parentId)
                        ->where('role', 'parent')
                        ->update(['aktif' => false]);
                }
            }
        });

        return response()->json(['message' => 'Operasi hapus siswa berhasil']);
    }

    public function saldo(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        if ($request->user()->role === 'parent' && $student->parent_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: Anda tidak berhak mengakses data student ini'], 403);
        }
        
        return response()->json([
            'student_id' => $student->id,
            'nama' => $student->nama,
            'saldo' => $student->saldo_virtual,
            'limit_harian' => $student->limit_harian,
            'sisa_limit' => $student->sisa_limit_hari_ini
        ]);
    }

    public function histori(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        if ($request->user()->role === 'parent' && $student->parent_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden: Anda tidak berhak mengakses data student ini'], 403);
        }
        
        $transactions = $student->transactions()->with('merchant:id,nama_kantin')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($transactions);
    }
    public function exportExcel()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\StudentExport, 'students.xlsx');
    }

    public function importExcel(ImportStudentRequest $request)
    {
        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\StudentImport, $request->file('file'));
            return response()->json(['message' => 'Data students berhasil diimport']);
        } catch (\Exception $e) {
            Log::error('StudentController@importExcel failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengimport data: ' . $e->getMessage()], 500);
        }
    }
}
