<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\TopupController;
use App\Http\Controllers\PedagangController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\DashboardController;

// Auth Routes (Public)
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load(['siswas', 'pedagang']);
    });

    // Admin Routes
    Route::middleware('role:admin')->group(function () {
        // Siswa
        Route::get('/siswa', [SiswaController::class, 'index']);
        Route::post('/siswa', [SiswaController::class, 'store']);
        Route::patch('/siswa/{id}', [SiswaController::class, 'update']);
        Route::delete('/siswa/{id}', [SiswaController::class, 'destroy']);
        
        // Topup
        Route::post('/siswa/{id}/topup', [TopupController::class, 'store']);
        
        // Pedagang
        Route::get('/pedagang', [PedagangController::class, 'index']);
        Route::post('/pedagang', [PedagangController::class, 'store']);
        Route::patch('/pedagang/{id}', [PedagangController::class, 'update']);
        
        // Settlement
        Route::get('/settlement', [SettlementController::class, 'index']);
        Route::post('/settlement', [SettlementController::class, 'store']);
        Route::get('/settlement/{id}', [SettlementController::class, 'show']);
        
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        // Transaksi Global
        Route::get('/transaksi', [TransaksiController::class, 'index']);
    });

    // Ortu & Admin Routes
    Route::middleware('role:admin,ortu')->group(function () {
        Route::get('/siswa/{id}', [SiswaController::class, 'show']);
        Route::get('/siswa/{id}/saldo', [SiswaController::class, 'saldo']);
        Route::get('/siswa/{id}/histori', [SiswaController::class, 'histori']);
    });

    // Pedagang & Admin Routes
    Route::middleware('role:admin,pedagang')->group(function () {
        Route::get('/pedagang/{id}/penjualan', [PedagangController::class, 'penjualan']);
    });

    // Pedagang Routes (Only)
    Route::middleware('role:pedagang')->group(function () {
        Route::post('/transaksi', [TransaksiController::class, 'store']);
    });
});
