<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $request->validate([
            'parent_id' => 'required|exists:users,id',
            'nis' => 'required|digits:10|unique:students',
            'nama' => 'required|string',
            'kelas' => 'required|string',
            'limit_harian' => 'required|numeric|min:500|max:20000'
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $student = Student::create([
                'parent_id' => $request->parent_id,
                'nis' => $request->nis,
                'nama' => $request->nama,
                'kelas' => $request->kelas,
                'saldo_virtual' => 0,
                'limit_harian' => $request->limit_harian,
                'aktif' => true,
            ]);

            // Generate Card — menggunakan UUID v4 untuk kriptografis acak
            $uid_rfid = Str::random(10); // Dummy RFID for now if no scanner
            $qr_code_hash = (string) Str::uuid(); // UUID v4, cryptographically random

            Card::create([
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

    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);
        
        $request->validate([
            'nama' => 'sometimes|string',
            'kelas' => 'sometimes|string',
            'limit_harian' => 'sometimes|numeric|min:500|max:20000'
        ]);

        $student->update($request->only('nama', 'kelas', 'limit_harian'));

        return response()->json(['message' => 'Student berhasil diupdate', 'data' => $student]);
    }

    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);
        $student->update(['aktif' => false]);
        
        if ($student->card) {
            $student->card->update(['status_aktif' => false]);
        }

        return response()->json(['message' => 'Student berhasil dinonaktifkan']);
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

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\StudentImport, $request->file('file'));
            return response()->json(['message' => 'Data students berhasil diimport']);
        } catch (\Exception $e) {
            Log::error('StudentController@importExcel failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengimport data: ' . $e->getMessage()], 500);
        }
    }
}
