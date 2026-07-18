<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\Card;

class ParentStudentSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('ParentStudentSeeder: Dilewati di environment production.');
            return;
        }

        $parent = User::factory()->create([
            'name' => 'Bapak Ahmad',
            'email' => 'parent@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'parent',
        ]);

        $student = Student::create([
            'parent_id' => $parent->id,
            'nis' => '1234567890',
            'nama' => 'Budi Santoso',
            'kelas' => 'X-A',
            'saldo_virtual' => 50000,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        Card::create([
            'student_id' => $student->id,
            'uid_rfid' => 'A1B2C3D4E5',
            'qr_code_hash' => 'hash_qr_budi_santoso_123',
            'status_aktif' => true,
        ]);
    }
}
