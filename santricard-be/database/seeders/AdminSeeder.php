<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('AdminSeeder: Dilewati di environment production.');
            return;
        }

        User::factory()->create([
            'name' => 'Admin Pondok',
            'email' => 'admin@santricard.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);
    }
}
