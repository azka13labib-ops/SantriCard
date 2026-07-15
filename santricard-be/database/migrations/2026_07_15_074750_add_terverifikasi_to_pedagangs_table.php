<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedagangs', function (Blueprint $table) {
            // Flag apakah admin sudah memverifikasi pedagang ini
            // Pedagang yang belum diverifikasi tidak bisa menerima transaksi
            $table->boolean('terverifikasi')->default(false)->after('lokasi');
        });
    }

    public function down(): void
    {
        Schema::table('pedagangs', function (Blueprint $table) {
            $table->dropColumn('terverifikasi');
        });
    }
};
