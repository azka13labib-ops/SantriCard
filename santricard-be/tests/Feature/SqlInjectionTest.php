<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

/**
 * SQL Injection Security Tests
 *
 * Verifikasi bahwa semua endpoint utama tidak rentan terhadap:
 * - Classic/tautology injection  ("OR 1=1")
 * - Error-based injection        (EXTRACTVALUE, UNION SELECT)
 * - Boolean blind injection      (TRUE vs FALSE payload comparison)
 * - Path parameter injection     (/student/{id})
 *
 * Laravel Eloquent menggunakan PDO prepared statements, sehingga
 * semua payload di bawah harus menghasilkan 401/422, BUKAN 200.
 */
class SqlInjectionTest extends TestCase
{
    use RefreshDatabase;

    private array $classicPayloads = [
        "' OR '1'='1",
        "' OR 1=1 --",
        "' OR 1=1 #",
        "admin'--",
        "' OR 'x'='x",
        "1' OR '1'='1' /*",
        "') OR ('1'='1",
    ];

    private array $errorBasedPayloads = [
        "1 UNION SELECT null,null,null --",
        "1 UNION SELECT table_name,null,null FROM information_schema.tables --",
        "'; SELECT SLEEP(0); --",
    ];

    // 1. Login identifier (classic)
    public function test_login_classic_injection_in_identifier_is_rejected(): void
    {
        foreach ($this->classicPayloads as $payload) {
            $response = $this->postJson('/api/auth/login', [
                'identifier' => $payload,
                'password'   => 'anything',
            ]);
            $this->assertNotEquals(200, $response->status(),
                "VULN: Payload [{$payload}] berhasil login!");
            $body = $response->getContent();
            $this->assertStringNotContainsStringIgnoringCase('SQLSTATE', $body);
            $this->assertStringNotContainsStringIgnoringCase('syntax error', $body);
        }
    }

    // 2. Login identifier (error-based)
    public function test_login_error_based_injection_does_not_expose_db(): void
    {
        $dangerous = ['SQLSTATE', 'syntax error', 'PDOException', 'information_schema'];
        foreach ($this->errorBasedPayloads as $payload) {
            $response = $this->postJson('/api/auth/login', [
                'identifier' => $payload,
                'password'   => 'anything',
            ]);
            $body = $response->getContent();
            foreach ($dangerous as $keyword) {
                $this->assertStringNotContainsStringIgnoringCase($keyword, $body,
                    "VULN: Payload [{$payload}] mengekspos [{$keyword}]!");
            }
        }
    }

    // 3. Login password field
    public function test_login_sql_injection_in_password_cannot_bypass_auth(): void
    {
        User::factory()->create([
            'role'             => 'parent',
            'email'            => 'victim@example.com',
            'password'         => bcrypt('realpassword'),
            'perlu_setup_akun' => false,
        ]);
        foreach ($this->classicPayloads as $payload) {
            $response = $this->postJson('/api/auth/login', [
                'identifier' => 'victim@example.com',
                'password'   => $payload,
            ]);
            $this->assertNotEquals(200, $response->status(),
                "VULN: Password payload [{$payload}] bypass auth!");
        }
    }

    // 4. NISN login (numeric field)
    public function test_nisn_login_rejects_sql_injection(): void
    {
        $payloads = [
            "1 OR 1=1",
            "0 UNION SELECT * FROM users",
            "'; DROP TABLE students; --",
            "1 AND SLEEP(0) --",
        ];
        foreach ($payloads as $payload) {
            $response = $this->postJson('/api/auth/login', ['identifier' => $payload]);
            $this->assertNotEquals(200, $response->status(),
                "VULN: NISN payload [{$payload}] lolos autentikasi!");
        }
    }

    // 5. Student ID path parameter
    public function test_student_endpoint_rejects_sql_in_id(): void
    {
        $admin = User::factory()->create([
            'role'     => 'admin',
            'email'    => 'admin@test.com',
            'password' => bcrypt('pass'),
        ]);
        $token = $admin->createToken('test')->plainTextToken;
        $sqlIds = [
            "1 OR 1=1",
            "1; DROP TABLE students; --",
            "1 UNION SELECT * FROM users",
            "' OR '1'='1",
        ];
        foreach ($sqlIds as $id) {
            $response = $this->withToken($token)->getJson("/api/student/{$id}");
            $this->assertNotEquals(200, $response->status(),
                "VULN: student ID [{$id}] menghasilkan 200 OK!");
        }
    }

    // 6. Boolean blind: respons TRUE vs FALSE harus identik
    public function test_login_not_vulnerable_to_boolean_blind_injection(): void
    {
        $resTrue  = $this->postJson('/api/auth/login', ['identifier' => "' OR '1'='1", 'password' => 'x']);
        $resFalse = $this->postJson('/api/auth/login', ['identifier' => "' OR '1'='2", 'password' => 'x']);
        $this->assertEquals($resTrue->status(), $resFalse->status(),
            'VULN: Status berbeda antara payload TRUE dan FALSE - Boolean blind injection!');
    }

    // 7. Tidak ada internal DB error yang bocor ke respons
    public function test_api_never_exposes_internal_db_errors(): void
    {
        $allPayloads = array_merge($this->classicPayloads, $this->errorBasedPayloads);
        $dangerous = ['SQLSTATE', 'syntax error', 'PDOException', 'information_schema', 'QueryException'];
        foreach ($allPayloads as $payload) {
            $response = $this->postJson('/api/auth/login', [
                'identifier' => $payload,
                'password'   => $payload,
            ]);
            $body = $response->getContent();
            foreach ($dangerous as $keyword) {
                $this->assertStringNotContainsStringIgnoringCase($keyword, $body,
                    "VULN: [{$keyword}] terekspos untuk payload [{$payload}]");
            }
        }
    }
}
