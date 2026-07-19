<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan kolom `catatan` ke tabel settlements.
     * Kolom ini ada di $fillable Settlement model dan dipakai SettlementController,
     * tapi tidak ada di migration awal — menyebabkan data catatan hilang.
     */
    public function up(): void
    {
        Schema::table('settlements', function (Blueprint $table) {
            $table->text('catatan')->nullable()->after('nominal');
        });
    }

    public function down(): void
    {
        Schema::table('settlements', function (Blueprint $table) {
            $table->dropColumn('catatan');
        });
    }
};
