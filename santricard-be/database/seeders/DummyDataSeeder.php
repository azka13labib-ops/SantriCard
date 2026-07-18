<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Merchant;
use App\Models\Transaction;
use App\Models\TopUp;
use App\Models\Settlement;
use App\Models\User;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run()
    {
        $student = Student::first();
        if (!$student) {
            $student = Student::create([
                'nis' => '1234567890',
                'nama' => 'Dummy Student',
                'saldo' => 50000,
                'status' => 'aktif',
            ]);
        }

        $merchant = Merchant::first();
        if (!$merchant) {
            $merchant = Merchant::create([
                'user_id' => User::factory()->create()->id,
                'nama_kantin' => 'Kantin Dummy',
                'lokasi' => 'Gedung A',
                'saldo_mengendap' => 100000,
            ]);
        }

        // Transactions
        for ($i = 1; $i <= 5; $i++) {
            Transaction::create([
                'student_id' => $student->id,
                'merchant_id' => $merchant->id,
                'nominal' => rand(5000, 20000),
                'status' => ['berhasil', 'gagal'][array_rand(['berhasil', 'gagal'])],
                'created_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }

        // TopUps
        for ($i = 1; $i <= 5; $i++) {
            TopUp::create([
                'student_id' => $student->id,
                'nominal' => rand(20000, 100000),
                'metode' => 'qris_statis',
                'status' => ['berhasil', 'gagal', 'pending'][array_rand(['berhasil', 'gagal', 'pending'])],
                'created_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }

        // Settlements
        for ($i = 1; $i <= 5; $i++) {
            Settlement::create([
                'merchant_id' => $merchant->id,
                'nominal' => rand(50000, 200000),
                'status' => ['berhasil', 'gagal', 'pending'][array_rand(['berhasil', 'gagal', 'pending'])],
                'created_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }
    }
}
