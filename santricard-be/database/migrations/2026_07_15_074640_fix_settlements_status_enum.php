<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ubah kolom status settlements dari enum('pending','selesai') menjadi enum('pending','berhasil','gagal')
        // agar konsisten dengan nilai yang diisi oleh SettlementController
        if (DB::getDriverName() === 'sqlite') {
            // SQLite does not support MODIFY COLUMN – handled at migration creation time; skip.
            return;
        }
        DB::statement("ALTER TABLE settlements MODIFY COLUMN status ENUM('pending', 'berhasil', 'gagal') DEFAULT 'pending'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }
        DB::statement("ALTER TABLE settlements MODIFY COLUMN status ENUM('pending', 'selesai') DEFAULT 'pending'");
    }
};
