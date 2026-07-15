<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ResetLimitHarian extends Command
{
    /**
     * Nama dan signature command.
     * Dijalankan tiap jam 00:00 oleh scheduler untuk memastikan
     * logika limit harian konsisten dan tercatat di log.
     */
    protected $signature = 'santricard:reset-limit-harian';

    protected $description = 'Log bahwa limit harian siswa telah direset pada tengah malam. 
        Sistem menggunakan whereDate(today()) sehingga reset bersifat otomatis, 
        namun command ini memastikan konfirmasi eksplisit dan auditability.';

    public function handle(): void
    {
        // Karena sistem menghitung limit via accessor getSisaLimitHariIniAttribute()
        // dengan whereDate('created_at', today()), reset terjadi otomatis setiap hari.
        // Command ini dijalankan scheduler untuk konfirmasi eksplisit dan logging audit.
        
        $tanggal = now()->toDateString();
        $jumlahSiswa = \App\Models\Siswa::where('aktif', true)->count();

        Log::info("SantriCard: Limit harian siswa direset otomatis untuk tanggal {$tanggal}. Total siswa aktif: {$jumlahSiswa}.");
        
        $this->info("✅ Limit harian untuk {$jumlahSiswa} siswa aktif telah direset untuk tanggal {$tanggal}.");
    }
}
