<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (method_exists($response, 'header')) {
            // Mencegah clickjacking (web kita tidak bisa diembed iframe)
            $response->header('X-Frame-Options', 'DENY');
            // Mencegah mime-sniffing
            $response->header('X-Content-Type-Options', 'nosniff');
            // Mengaktifkan filter XSS di browser
            $response->header('X-XSS-Protection', '1; mode=block');
            // Memastikan akses HTTPS (HSTS)
            $response->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            // Content Security Policy basic (bisa disesuaikan nanti)
            $response->header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: http: https:;");
        }

        return $response;
    }
}
