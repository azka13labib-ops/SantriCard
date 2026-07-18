<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Card;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

class StudentParentCascadeTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /** Helper: buat parent + student + card */
    private function makeStudentWithParent(User $parent, string $nis): Student
    {
        $student = Student::create([
            'parent_id'     => $parent->id,
            'nis'           => $nis,
            'nama'          => 'Test Siswa ' . $nis,
            'kelas'         => 'VII A',
            'saldo_virtual' => 0,
            'limit_harian'  => 20000,
            'aktif'         => true,
        ]);

        Card::create([
            'student_id'   => $student->id,
            'uid_rfid'     => Str::random(10),
            'qr_code_hash' => (string) Str::uuid(),
            'status_aktif' => true,
        ]);

        return $student;
    }

    // =========================================================================
    // Test 1 – CASCADE: orang tua dengan satu anak → orang tua ikut nonaktif
    // =========================================================================
    public function test_deleting_only_child_also_soft_deletes_parent(): void
    {
        $parent  = User::factory()->create(['role' => 'parent', 'aktif' => true]);
        $student = $this->makeStudentWithParent($parent, '9990001');

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/student/{$student->id}")
            ->assertOk();

        // Siswa dihapus permanen (tidak ada riwayat transaksi/topup)
        $this->assertDatabaseMissing('students', ['id' => $student->id]);

        // Orang tua harus ikut dinonaktifkan
        $this->assertDatabaseHas('users', ['id' => $parent->id, 'aktif' => false]);
    }

    // =========================================================================
    // Test 2 – CASCADE: orang tua dengan dua anak → orang tua TIDAK ikut nonaktif
    // =========================================================================
    public function test_deleting_one_of_two_children_does_not_deactivate_parent(): void
    {
        $parent   = User::factory()->create(['role' => 'parent', 'aktif' => true]);
        $student1 = $this->makeStudentWithParent($parent, '9990002');
        $student2 = $this->makeStudentWithParent($parent, '9990003');

        // Hapus salah satu anak
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/student/{$student1->id}")
            ->assertOk();

        // Orang tua harus TETAP aktif karena masih punya anak lain
        $this->assertDatabaseHas('users', ['id' => $parent->id, 'aktif' => true]);

        // Anak kedua masih bisa diakses normal
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/student/{$student2->id}")
            ->assertOk();

        $this->assertEquals($student2->id, $response->json('id'));
        $this->assertTrue((bool) $response->json('aktif'));
    }

    // =========================================================================
    // Test 3 – jumlah_anak mengembalikan integer, bukan array/objek
    // =========================================================================
    public function test_jumlah_anak_returns_integer_count(): void
    {
        $parent = User::factory()->create(['role' => 'parent', 'aktif' => true]);
        $this->makeStudentWithParent($parent, '9990010');
        $this->makeStudentWithParent($parent, '9990011');

        // Cek lewat accessor langsung di model
        $parent->refresh();
        $this->assertIsInt($parent->jumlah_anak);
        $this->assertEquals(2, $parent->jumlah_anak);

        // Cek lewat API endpoint /api/parent (index)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/parent');

        $response->assertOk();

        // Cari parent kita di response, pastikan students_count (withCount) atau jumlah_anak = 2
        $data = $response->json();
        $found = collect($data)->firstWhere('id', $parent->id);
        $this->assertNotNull($found);

        // ParentController sudah memakai withCount('students')
        // Nilai students_count harus 2 (integer)
        $this->assertEquals(2, $found['students_count']);
        $this->assertIsInt($found['students_count']);
    }
}
