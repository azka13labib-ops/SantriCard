<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Siswa;
use App\Models\Kartu;

class OrtuSiswaSeeder extends Seeder
{
    public function run(): void
    {
        $ortu = User::factory()->create([
            'name' => 'Bapak Ahmad',
            'email' => 'ortu@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'ortu',
        ]);

        $siswa = Siswa::create([
            'ortu_id' => $ortu->id,
            'nis' => '1234567890',
            'nama' => 'Budi Santoso',
            'kelas' => 'X-A',
            'saldo_virtual' => 50000,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        Kartu::create([
            'siswa_id' => $siswa->id,
            'uid_rfid' => 'A1B2C3D4E5',
            'qr_code_hash' => 'hash_qr_budi_santoso_123',
            'status_aktif' => true,
        ]);
    }
}
