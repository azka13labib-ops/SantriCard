<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithSkipDuplicates;

class StudentImport implements ToModel, WithHeadingRow, WithValidation, WithSkipDuplicates
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Validasi kolom esensial (sudah ditangani WithValidation, ini sebagai fallback)
        if (!isset($row['nis']) || !isset($row['name']) || !isset($row['class']) || !isset($row['parent_id'])) {
            return null;
        }

        return new Student([
            'parent_id'     => $row['parent_id'],
            'nis'           => $row['nis'],
            'nama'          => $row['name'],
            'kelas'         => $row['class'],
            // SEC-08: virtual_balance dihapus dari import.
            // Saldo awal harus 0. Top-up dilakukan melalui alur resmi (submit bukti → verifikasi admin).
            'saldo_virtual' => 0,
            'limit_harian'  => isset($row['daily_limit']) ? (int) $row['daily_limit'] : 20000,
            'aktif'         => isset($row['status']) ? ($row['status'] == 'Aktif' ? true : false) : true,
        ]);
    }

    /**
     * SEC-08: Validasi per-baris sebelum import diterapkan.
     */
    public function rules(): array
    {
        return [
            'nis'        => ['required', 'string', 'max:20', 'unique:students,nis'],
            'name'       => ['required', 'string', 'max:255'],
            'class'      => ['required', 'string', 'max:50'],
            'parent_id'  => [
                'required',
                'integer',
                // Pastikan parent_id benar-benar user dengan role 'parent'
                function ($attribute, $value, $fail) {
                    $exists = User::where('id', $value)->where('role', 'parent')->exists();
                    if (!$exists) {
                        $fail("parent_id {$value} tidak valid atau bukan role parent.");
                    }
                },
            ],
            'daily_limit' => ['nullable', 'integer', 'min:1000', 'max:50000'],
        ];
    }

    /**
     * Pesan error validasi yang lebih informatif.
     */
    public function customValidationMessages(): array
    {
        return [
            'nis.required'        => 'Kolom NIS wajib diisi.',
            'nis.unique'          => 'NIS :input sudah terdaftar di sistem.',
            'name.required'       => 'Kolom Name wajib diisi.',
            'class.required'      => 'Kolom Class wajib diisi.',
            'parent_id.required'  => 'Kolom Parent ID wajib diisi.',
            'daily_limit.min'     => 'Limit harian minimal Rp 1.000.',
            'daily_limit.max'     => 'Limit harian maksimal Rp 50.000.',
        ];
    }
}
