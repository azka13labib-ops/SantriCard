<?php

namespace App\Imports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Validasi kolom esensial
        if (!isset($row['nis']) || !isset($row['name']) || !isset($row['class']) || !isset($row['parent_id'])) {
            return null;
        }

        return new Student([
            'parent_id'     => $row['parent_id'],
            'nis'           => $row['nis'],
            'nama'          => $row['name'],
            'kelas'         => $row['class'],
            'saldo_virtual' => isset($row['virtual_balance']) ? $row['virtual_balance'] : 0,
            'limit_harian'  => isset($row['daily_limit']) ? $row['daily_limit'] : 20000,
            'aktif'         => isset($row['status']) ? ($row['status'] == 'Aktif' ? true : false) : true,
        ]);
    }
}
