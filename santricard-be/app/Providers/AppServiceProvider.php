<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\TopUpServiceInterface::class,
            \App\Services\TopUpService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::preventLazyLoading(! app()->isProduction());

        // Konfigurasi Global Rate Limit (Mencegah DDoS)
        // Maksimal 60 request per menit per IP untuk semua route API
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Konfigurasi Rate Limit khusus Login (Mencegah Brute Force)
        // P1-D: 10 percobaan per 5 menit di production, tidak dibatasi saat local dev
        \Illuminate\Support\Facades\RateLimiter::for('login', function (\Illuminate\Http\Request $request) {
            if (app()->environment('local', 'testing')) {
                return \Illuminate\Cache\RateLimiting\Limit::none();
            }
            return \Illuminate\Cache\RateLimiting\Limit::perMinutes(5, 10)->by($request->ip());
        });
    }
}
