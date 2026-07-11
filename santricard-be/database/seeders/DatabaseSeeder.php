<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat User Admin
        \App\Models\User::factory()->create([
            'name' => 'Admin Pondok',
            'email' => 'admin@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // 2. Buat User Orang Tua
        $ortu = \App\Models\User::factory()->create([
            'name' => 'Bapak Ahmad',
            'email' => 'ortu@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'ortu',
        ]);

        // 3. Buat Data Siswa (Anak dari Bapak Ahmad)
        $siswa = \App\Models\Siswa::create([
            'ortu_id' => $ortu->id,
            'nis' => '1234567890',
            'nama' => 'Budi Santoso',
            'kelas' => 'X-A',
            'saldo_virtual' => 50000,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        // 4. Buat Data Kartu untuk Siswa
        \App\Models\Kartu::create([
            'siswa_id' => $siswa->id,
            'uid_rfid' => 'A1B2C3D4E5',
            'qr_code_hash' => 'hash_qr_budi_santoso_123',
            'status_aktif' => true,
        ]);

        // 5. Buat User Pedagang (Kantin)
        $pedagangUser = \App\Models\User::factory()->create([
            'name' => 'Ibu Siti',
            'email' => 'kantin@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'pedagang',
        ]);

        // 6. Buat Profil Pedagang
        \App\Models\Pedagang::create([
            'user_id' => $pedagangUser->id,
            'nama_kantin' => 'Kantin Sehat Bu Siti',
            'lokasi' => 'Gedung Utara',
            'saldo_mengendap' => 0,
        ]);
    }
}
