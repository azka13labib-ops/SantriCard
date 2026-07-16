<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── SantriCard Scheduler ──
// Reset limit harian student — dijalankan tiap tengah malam
// Gunakan: php artisan schedule:run (via cron OS: "* * * * * php /path/artisan schedule:run")
Schedule::command('santricard:reset-limit-harian')->dailyAt('00:00');
