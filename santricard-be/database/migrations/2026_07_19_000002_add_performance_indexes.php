<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * P2-A: Tambah index untuk kolom yang sering di-query.
     *
     * Kolom yang di-index:
     * - students.parent_id     : diquery setiap kali parent akses dashboard
     * - transactions.student_id + created_at + status  : dipakai oleh getSisaLimitHariIniAttribute()
     *                                                    setiap kali ada transaksi
     * - transactions.merchant_id : diquery di halaman histori merchant
     * - top_ups.student_id     : diquery di halaman riwayat topup parent
     * - top_ups.status         : diquery untuk filter pending/berhasil/gagal
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->index('parent_id', 'idx_students_parent_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            // Composite index untuk query limit harian: WHERE student_id=? AND DATE(created_at)=? AND status=?
            $table->index(['student_id', 'created_at', 'status'], 'idx_transactions_student_date_status');
            $table->index('merchant_id', 'idx_transactions_merchant_id');
        });

        Schema::table('top_ups', function (Blueprint $table) {
            $table->index('student_id', 'idx_topups_student_id');
            $table->index('status', 'idx_topups_status');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('idx_students_parent_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_student_date_status');
            $table->dropIndex('idx_transactions_merchant_id');
        });

        Schema::table('top_ups', function (Blueprint $table) {
            $table->dropIndex('idx_topups_student_id');
            $table->dropIndex('idx_topups_status');
        });
    }
};
