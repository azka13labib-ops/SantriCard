<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Pedagang;

class PedagangSeeder extends Seeder
{
    public function run(): void
    {
        $pedagangUser = User::factory()->create([
            'name' => 'Ibu Siti',
            'email' => 'kantin@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'pedagang',
        ]);

        Pedagang::create([
            'user_id' => $pedagangUser->id,
            'nama_kantin' => 'Kantin Sehat Bu Siti',
            'lokasi' => 'Gedung Utara',
            'saldo_mengendap' => 0,
        ]);
    }
}
