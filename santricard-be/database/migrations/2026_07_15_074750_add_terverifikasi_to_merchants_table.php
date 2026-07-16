<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            // Flag apakah admin sudah memverifikasi merchant ini
            // Merchant yang belum diverifikasi tidak bisa menerima transaction
            $table->boolean('terverifikasi')->default(false)->after('lokasi');
        });
    }

    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn('terverifikasi');
        });
    }
};
