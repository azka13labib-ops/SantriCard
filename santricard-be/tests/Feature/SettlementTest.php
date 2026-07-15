<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Siswa;
use App\Models\Pedagang;
use App\Models\Settlement;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SettlementTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Pedagang $pedagang;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create(['role' => 'admin']);

        $pedagangUser = User::factory()->create(['role' => 'pedagang']);
        $this->pedagang = Pedagang::create([
            'user_id' => $pedagangUser->id,
            'nama_kantin' => 'Kantin Test',
            'lokasi' => 'Gedung A',
            'saldo_mengendap' => 0,
            'terverifikasi' => true,
        ]);
    }

    /** @test */
    public function settlement_berhasil_saat_saldo_mengendap_ada(): void
    {
        // Isi saldo mengendap
        $this->pedagang->saldo_mengendap = 150000;
        $this->pedagang->save();

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/settlement', [
                'pedagang_id' => $this->pedagang->id,
                'catatan' => 'Pencairan mingguan',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Pencairan dana berhasil');

        // Pastikan saldo mengendap jadi 0
        $this->assertDatabaseHas('pedagangs', [
            'id' => $this->pedagang->id,
            'saldo_mengendap' => 0,
        ]);

        // Pastikan settlement tercatat
        $this->assertDatabaseHas('settlements', [
            'pedagang_id' => $this->pedagang->id,
            'nominal' => 150000,
        ]);
    }

    /** @test */
    public function settlement_gagal_saat_saldo_mengendap_nol(): void
    {
        // Saldo sudah 0 dari setUp
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/settlement', [
                'pedagang_id' => $this->pedagang->id,
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'Tidak ada saldo yang bisa dicairkan');
    }

    /** @test */
    public function settlement_hanya_bisa_diakses_admin(): void
    {
        $ortuUser = User::factory()->create(['role' => 'ortu']);

        $response = $this->actingAs($ortuUser, 'sanctum')
            ->postJson('/api/settlement', [
                'pedagang_id' => $this->pedagang->id,
            ]);

        $response->assertStatus(403);
    }
}
