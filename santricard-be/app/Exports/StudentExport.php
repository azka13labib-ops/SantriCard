<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Student::with('parent', 'card')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Parent Name',
            'NIS',
            'Name',
            'Class',
            'Virtual Balance',
            'Daily Limit',
            'Status',
        ];
    }

    public function map(mixed $student): array
    {
        return [
            $student->id,
            $student->parent ? $student->parent->name : '',
            $student->nis,
            $student->nama,
            $student->kelas,
            $student->saldo_virtual,
            $student->limit_harian,
            $student->aktif ? 'Aktif' : 'Non-Aktif',
            // RFID UID tidak disertakan
        ];
    }
}
