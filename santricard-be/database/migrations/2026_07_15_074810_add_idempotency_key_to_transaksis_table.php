<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaksis', function (Blueprint $table) {
            // Idempotency key: UUID yang dikirim klien untuk mencegah transaksi ganda
            $table->string('idempotency_key', 50)->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('transaksis', function (Blueprint $table) {
            $table->dropColumn('idempotency_key');
        });
    }
};
