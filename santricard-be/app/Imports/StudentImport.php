<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\User;
use App\Models\Card;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithSkipDuplicates;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class StudentImport implements ToCollection, WithHeadingRow, WithValidation, WithSkipDuplicates
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (!isset($row['nis']) || !isset($row['name']) || !isset($row['class']) || !isset($row['parent_name']) || !isset($row['parent_email'])) {
                continue;
            }

            DB::transaction(function () use ($row) {
                // Cari atau buat parent berdasarkan email
                $parent = User::firstOrCreate(
                    ['email' => $row['parent_email']],
                    [
                        'name'             => $row['parent_name'],
                        'password'         => bcrypt(Str::random(10)), // Gunakan random password karena akan login via NISN
                        'role'             => 'parent',
                        'perlu_setup_akun' => true,
                    ]
                );

                // Buat Student
                $student = Student::create([
                    'parent_id'     => $parent->id,
                    'nis'           => $row['nis'],
                    'nama'          => $row['name'],
                    'kelas'         => $row['class'],
                    'saldo_virtual' => 0,
                    'limit_harian'  => isset($row['daily_limit']) ? (int) $row['daily_limit'] : 20000,
                    'aktif'         => isset($row['status']) ? ($row['status'] == 'Aktif' ? true : false) : true,
                ]);

                // Buat Card untuk Student
                Card::create([
                    'student_id'   => $student->id,
                    'uid_rfid'     => Str::random(10),
                    'qr_code_hash' => (string) Str::uuid(),
                    'status_aktif' => true,
                ]);
            });
        }
    }

    public function prepareForValidation($data, $index)
    {
        if (isset($data['nis'])) {
            $data['nis'] = trim((string) $data['nis']);
        }
        if (isset($data['name'])) {
            $data['name'] = trim((string) $data['name']);
        }
        if (isset($data['class'])) {
            $data['class'] = trim((string) $data['class']);
        }
        if (isset($data['parent_name'])) {
            $data['parent_name'] = trim((string) $data['parent_name']);
        }
        if (isset($data['parent_email'])) {
            $data['parent_email'] = trim((string) $data['parent_email']);
        }
        if (isset($data['status'])) {
            $data['status'] = trim((string) $data['status']);
        }

        return $data;
    }

    public function rules(): array
    {
        return [
            'nis'          => ['required', 'string', 'max:20', 'unique:students,nis'],
            'name'         => ['required', 'string', 'max:255'],
            'class'        => ['required', 'string', 'max:50'],
            'parent_name'  => ['required', 'string', 'max:255'],
            'parent_email' => ['required', 'email'],
            'daily_limit'  => ['nullable', 'integer', 'min:1000', 'max:50000'],
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'nis.required'          => 'Kolom NIS wajib diisi.',
            'nis.unique'            => 'NIS :input sudah terdaftar di sistem.',
            'name.required'         => 'Kolom Name wajib diisi.',
            'class.required'        => 'Kolom Class wajib diisi.',
            'parent_name.required'  => 'Kolom Parent Name wajib diisi.',
            'parent_email.required' => 'Kolom Parent Email wajib diisi.',
            'parent_email.email'    => 'Format Parent Email tidak valid.',
            'daily_limit.min'       => 'Limit harian minimal Rp 1.000.',
            'daily_limit.max'       => 'Limit harian maksimal Rp 50.000.',
        ];
    }
}
