<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TopUpController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ParentController;

// Auth Routes (Public)
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Protected Routes
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/setup-password', [AuthController::class, 'setupPassword']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load(['students', 'merchant']);
    });

    // Admin Routes
    Route::middleware('role:admin')->group(function () {
        // Daftar Ortu untuk form tambah student
        Route::get('/users/parent', [ParentController::class, 'index']);
        
        // Manajemen Ortu
        Route::get('/parent', [ParentController::class, 'index']);
        Route::post('/parent', [ParentController::class, 'store']);
        Route::get('/parent/{id}/students', [ParentController::class, 'students']);
        Route::post('/parent/{id}/reset-password', [ParentController::class, 'resetPassword']);
        Route::patch('/parent/{id}', [ParentController::class, 'update']);
        Route::delete('/parent/{id}', [ParentController::class, 'destroy']);

        // Student
        Route::get('/student', [StudentController::class, 'index']);
        Route::get('/student/export', [StudentController::class, 'exportExcel']);
        Route::post('/student/import', [StudentController::class, 'importExcel']);
        Route::post('/student', [StudentController::class, 'store']);
        Route::patch('/student/{id}', [StudentController::class, 'update']);
        Route::delete('/student/{id}', [StudentController::class, 'destroy']);
        
        // TopUp Admin Verification
        Route::get('/topUp', [TopUpController::class, 'index']);
        Route::post('/topUp/{id}/verifikasi', [TopUpController::class, 'verifikasi']);
        
        // Merchant
        Route::get('/merchant', [MerchantController::class, 'index']);
        Route::post('/merchant', [MerchantController::class, 'store']);
        Route::patch('/merchant/{id}', [MerchantController::class, 'update']);
        Route::post('/merchant/{id}/verifikasi', [MerchantController::class, 'verifikasi']);
        
        // Settlement
        Route::get('/settlement', [SettlementController::class, 'index']);
        Route::post('/settlement', [SettlementController::class, 'store']);
        Route::get('/settlement/{id}', [SettlementController::class, 'show']);
        
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        // Transaction Global
        Route::get('/transaction', [TransactionController::class, 'index']);
    });

    // Ortu & Admin Routes
    Route::middleware('role:admin,parent')->group(function () {
        Route::get('/student/{id}', [StudentController::class, 'show']);
        Route::get('/student/{id}/saldo', [StudentController::class, 'saldo']);
        Route::get('/student/{id}/histori', [StudentController::class, 'histori']);
        
        // TopUp
        Route::post('/student/{id}/topUp', [TopUpController::class, 'store']);
        Route::get('/student/{id}/topUp', [TopUpController::class, 'history']); // For checking topUp status
        
        // Download bukti transfer dari private storage (SEC-07)
        Route::get('/topUp/{id}/bukti', [TopUpController::class, 'downloadBukti']);
    });

    // Merchant & Admin Routes
    Route::middleware('role:admin,merchant')->group(function () {
        Route::get('/merchant/{id}/penjualan', [MerchantController::class, 'penjualan']);
    });

    // Merchant Routes (Only)
    Route::middleware('role:merchant')->group(function () {
        Route::post('/transaction', [TransactionController::class, 'store'])->middleware('throttle:60,1');
    });
});
