<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransaksiController;

// Auth Routes (Public)
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return clone $request->user();
    });

    // Pedagang Routes
    Route::middleware('role:pedagang')->group(function () {
        Route::post('/transaksi', [TransaksiController::class, 'store']);
    });
});
