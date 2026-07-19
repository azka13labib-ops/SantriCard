<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Card;
use App\Models\Merchant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

/**
 * P1-E: Fixed - Model names updated from old Indonesian names (Siswa, Kartu, Pedagang)
 * to current English names (Student, Card, Merchant). Endpoint updated to /api/transaction.
 * Field names updated (ortu_id → parent_id, siswa_id → student_id, pedagang_id → merchant_id).
 */
class TransaksiTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $merchantUser;
    private User $parentUser;
    private Merchant $merchant;
    private Student $student;
    private Card $card;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup admin
        $this->adminUser = User::factory()->create(['role' => 'admin']);

        // Setup parent
        $this->parentUser = User::factory()->create(['role' => 'parent']);

        // Setup merchant user + record
        $this->merchantUser = User::factory()->create(['role' => 'merchant']);
        $this->merchant = Merchant::create([
            'user_id' => $this->merchantUser->id,
            'nama_kantin' => 'Kantin Test',
            'lokasi' => 'Gedung A',
            'saldo_mengendap' => 0,
            'terverifikasi' => true,
        ]);

        // Setup student dengan saldo dan limit
        $this->student = Student::create([
            'parent_id' => $this->parentUser->id,
            'nis' => '1234567890',
            'nama' => 'Test Siswa',
            'kelas' => 'X-IPA 1',
            'saldo_virtual' => 10000,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        // Setup card untuk student
        $this->card = Card::create([
            'student_id' => $this->student->id,
            'uid_rfid' => Str::random(10),
            'qr_code_hash' => (string) Str::uuid(),
            'status_aktif' => true,
        ]);
    }

    /** @test */
    public function transaksi_berhasil_dengan_saldo_dan_limit_cukup(): void
    {
        $response = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 5000,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'berhasil');

        $this->assertDatabaseHas('students', [
            'id' => $this->student->id,
            'saldo_virtual' => 5000,
        ]);
    }

    /** @test */
    public function transaksi_ditolak_saat_saldo_tidak_cukup(): void
    {
        // Student hanya punya saldo 10000, coba transaksi 15000
        $response = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 15000,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'ditolak')
            ->assertJsonPath('alasan', 'Saldo tidak cukup');

        // Pastikan saldo tidak berubah
        $this->assertDatabaseHas('students', [
            'id' => $this->student->id,
            'saldo_virtual' => 10000,
        ]);
    }

    /** @test */
    public function transaksi_ditolak_saat_melebihi_limit_harian(): void
    {
        // Simulasi student sudah belanja 18000 hari ini
        \App\Models\Transaction::create([
            'student_id' => $this->student->id,
            'merchant_id' => $this->merchant->id,
            'nominal' => 18000,
            'status' => 'berhasil',
        ]);

        // Isi ulang saldo agar tidak terhambat oleh saldo tidak cukup
        $this->student->saldo_virtual = 50000;
        $this->student->save();

        // Coba transaksi 5000 lagi (total jadi 23000, melebihi limit 20000)
        $response = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 5000,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'ditolak')
            ->assertJsonFragment(['alasan' => 'Limit harian habis atau tidak mencukupi']);
    }

    /** @test */
    public function transaksi_ditolak_jika_kartu_tidak_valid(): void
    {
        $response = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => 'kartu-palsu-tidak-ada',
                'nominal' => 5000,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'ditolak');
    }

    /** @test */
    public function transaksi_ditolak_nominal_di_bawah_minimum(): void
    {
        $response = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 100, // di bawah min 500
            ]);

        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function transaksi_ditolak_jika_merchant_belum_diverifikasi(): void
    {
        // Buat merchant yang belum diverifikasi
        $unverifiedUser = User::factory()->create(['role' => 'merchant']);
        Merchant::create([
            'user_id' => $unverifiedUser->id,
            'nama_kantin' => 'Kantin Belum Terverifikasi',
            'lokasi' => 'Gedung B',
            'saldo_mengendap' => 0,
            'terverifikasi' => false,
        ]);

        $response = $this->actingAs($unverifiedUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 5000,
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'ditolak');
    }

    /** @test */
    public function transaksi_idempoten_tidak_diproses_dua_kali(): void
    {
        $idempotencyKey = (string) \Illuminate\Support\Str::uuid();

        // Request pertama - harus berhasil
        $res1 = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 2000,
                'idempotency_key' => $idempotencyKey,
            ]);
        $res1->assertStatus(200)->assertJsonPath('status', 'berhasil');

        // Request kedua dengan key yang sama - harus mengembalikan hasil lama (idempotent)
        $res2 = $this->actingAs($this->merchantUser, 'sanctum')
            ->postJson('/api/transaction', [
                'kode_kartu' => $this->card->qr_code_hash,
                'nominal' => 2000,
                'idempotency_key' => $idempotencyKey,
            ]);
        $res2->assertStatus(200)->assertJsonPath('status', 'berhasil');

        // Saldo hanya berkurang sekali (2000, bukan 4000)
        $this->assertDatabaseHas('students', [
            'id' => $this->student->id,
            'saldo_virtual' => 8000,
        ]);
    }
}
