<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Siswa;
use App\Models\Kartu;
use App\Models\Pedagang;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

class TransaksiTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $pedagangUser;
    private User $ortuUser;
    private Pedagang $pedagang;
    private Siswa $siswa;
    private Kartu $kartu;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup admin
        $this->adminUser = User::factory()->create(['role' => 'admin']);

        // Setup ortu
        $this->ortuUser = User::factory()->create(['role' => 'ortu']);

        // Setup pedagang user + record
        $this->pedagangUser = User::factory()->create(['role' => 'pedagang']);
        $this->pedagang = Pedagang::create([
            'user_id' => $this->pedagangUser->id,
            'nama_kantin' => 'Kantin Test',
            'lokasi' => 'Gedung A',
            'saldo_mengendap' => 0,
            'terverifikasi' => true,
        ]);

        // Setup siswa dengan saldo dan limit
        $this->siswa = Siswa::create([
            'ortu_id' => $this->ortuUser->id,
            'nis' => '1234567890',
            'nama' => 'Test Siswa',
            'kelas' => 'X-IPA 1',
            'saldo_virtual' => 10000,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        // Setup kartu untuk siswa
        $this->kartu = Kartu::create([
            'siswa_id' => $this->siswa->id,
            'uid_rfid' => Str::random(10),
            'qr_code_hash' => (string) Str::uuid(),
            'status_aktif' => true,
        ]);
    }

    /** @test */
    public function transaksi_berhasil_dengan_saldo_dan_limit_cukup(): void
    {
        $response = $this->actingAs($this->pedagangUser, 'sanctum')
            ->postJson('/api/transaksi', [
                'kode_kartu' => $this->kartu->qr_code_hash,
                'nominal' => 5000,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'berhasil');

        $this->assertDatabaseHas('siswas', [
            'id' => $this->siswa->id,
            'saldo_virtual' => 5000,
        ]);
    }

    /** @test */
    public function transaksi_ditolak_saat_saldo_tidak_cukup(): void
    {
        // Siswa hanya punya saldo 10000, coba transaksi 15000
        $response = $this->actingAs($this->pedagangUser, 'sanctum')
            ->postJson('/api/transaksi', [
                'kode_kartu' => $this->kartu->qr_code_hash,
                'nominal' => 15000,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'ditolak')
            ->assertJsonPath('alasan', 'Saldo tidak cukup');

        // Pastikan saldo tidak berubah
        $this->assertDatabaseHas('siswas', [
            'id' => $this->siswa->id,
            'saldo_virtual' => 10000,
        ]);
    }

    /** @test */
    public function transaksi_ditolak_saat_melebihi_limit_harian(): void
    {
        // Simulasi siswa sudah belanja 18000 hari ini
        \App\Models\Transaksi::create([
            'siswa_id' => $this->siswa->id,
            'pedagang_id' => $this->pedagang->id,
            'nominal' => 18000,
            'status' => 'berhasil',
        ]);

        // Potong saldo dulu supaya konsisten
        $this->siswa->saldo_virtual = $this->siswa->saldo_virtual - 18000;
        $this->siswa->save();
        // Isi ulang saldo agar tidak terhambat oleh saldo
        $this->siswa->saldo_virtual = 50000;
        $this->siswa->save();

        // Coba transaksi 5000 lagi (total jadi 23000, melebihi limit 20000)
        $response = $this->actingAs($this->pedagangUser, 'sanctum')
            ->postJson('/api/transaksi', [
                'kode_kartu' => $this->kartu->qr_code_hash,
                'nominal' => 5000,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'ditolak')
            ->assertJsonFragment(['alasan' => 'Limit harian habis atau tidak mencukupi']);
    }

    /** @test */
    public function transaksi_ditolak_jika_kartu_tidak_valid(): void
    {
        $response = $this->actingAs($this->pedagangUser, 'sanctum')
            ->postJson('/api/transaksi', [
                'kode_kartu' => 'kartu-palsu-tidak-ada',
                'nominal' => 5000,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('status', 'ditolak');
    }

    /** @test */
    public function transaksi_ditolak_nominal_di_bawah_minimum(): void
    {
        $response = $this->actingAs($this->pedagangUser, 'sanctum')
            ->postJson('/api/transaksi', [
                'kode_kartu' => $this->kartu->qr_code_hash,
                'nominal' => 100, // di bawah min 500
            ]);

        $response->assertStatus(422); // Validation error
    }
}
