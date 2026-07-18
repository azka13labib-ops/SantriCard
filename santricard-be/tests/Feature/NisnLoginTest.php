<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;

class NisnLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_with_perlu_setup_akun_can_login_via_nisn()
    {
        $parent = User::factory()->create([
            'role' => 'parent',
            'perlu_setup_akun' => true,
        ]);

        $student = Student::create([
            'parent_id' => $parent->id,
            'nis' => '1234567890',
            'nama' => 'Test Student',
            'kelas' => '10A',
            'saldo_virtual' => 0,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '1234567890',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token']);
    }

    public function test_parent_with_perlu_setup_akun_cannot_login_via_email()
    {
        $parent = User::factory()->create([
            'email' => 'parent@example.com',
            'password' => bcrypt('password'),
            'role' => 'parent',
            'perlu_setup_akun' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'parent@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
        $response->assertJsonFragment([
            'message' => 'Akun belum diaktifkan, silakan login menggunakan NISN anak terlebih dahulu.'
        ]);
    }

    public function test_parent_without_perlu_setup_akun_cannot_login_via_nisn()
    {
        $parent = User::factory()->create([
            'role' => 'parent',
            'perlu_setup_akun' => false,
        ]);

        $student = Student::create([
            'parent_id' => $parent->id,
            'nis' => '1234567891',
            'nama' => 'Test Student 2',
            'kelas' => '10A',
            'saldo_virtual' => 0,
            'limit_harian' => 20000,
            'aktif' => true,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '1234567891',
        ]);

        $response->assertStatus(401);
        $response->assertJsonFragment([
            'message' => 'Silakan login menggunakan email dan password.'
        ]);
    }

    public function test_parent_without_perlu_setup_akun_can_login_via_email()
    {
        $parent = User::factory()->create([
            'email' => 'parent2@example.com',
            'password' => bcrypt('password'),
            'role' => 'parent',
            'perlu_setup_akun' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'parent2@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token']);
    }

    public function test_parent_can_setup_password_and_login_status_changes()
    {
        $parent = User::factory()->create([
            'role' => 'parent',
            'perlu_setup_akun' => true,
        ]);

        $token = $parent->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/setup-password', [
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(200);
        
        $parent->refresh();
        $this->assertFalse($parent->perlu_setup_akun);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('newpassword123', $parent->password));
    }
}
