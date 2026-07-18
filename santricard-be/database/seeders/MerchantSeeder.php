<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Merchant;

class MerchantSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('MerchantSeeder: Dilewati di environment production.');
            return;
        }

        $pedagangUser = User::factory()->create([
            'name' => 'Ibu Siti',
            'email' => 'kantin@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'merchant',
        ]);

        Merchant::create([
            'user_id' => $pedagangUser->id,
            'nama_kantin' => 'Kantin Sehat Bu Siti',
            'lokasi' => 'Gedung Utara',
            'saldo_mengendap' => 0,
        ]);
    }
}
