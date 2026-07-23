<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Student;
use App\Models\Merchant;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        $data = Cache::remember('dashboard_stats', 300, function () {
            $today = today();

            $transaksisHariIni = Transaction::whereDate('created_at', $today)->get();

            $totalTransaksi = $transaksisHariIni->count();
            $transaksiBerhasil = $transaksisHariIni->where('status', 'berhasil')->count();
            $transaksiDitolak = $transaksisHariIni->where('status', 'ditolak')->count();
            $nominalTotal = $transaksisHariIni->where('status', 'berhasil')->sum('nominal');

            $totalSiswa = Student::count();
            $siswaAktif = Student::where('aktif', true)->count();
            $saldoBeredar = Student::sum('saldo_virtual');

            // P2-E: Merchant aktif = yang sudah terverifikasi (bukan semua)
            $totalPedagang = Merchant::count();
            $pedagangAktif = Merchant::where('terverifikasi', true)->count();

            $transaksiTerakhir = Transaction::with(['student', 'merchant'])
                ->latest()
                ->take(5)
                ->get();

            // Data untuk Chart (7 hari terakhir)
            $chartData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = \Carbon\Carbon::today()->subDays($i);
                $dailyTransactions = Transaction::whereDate('created_at', $date)
                    ->where('status', 'berhasil')
                    ->sum('nominal');

                $chartData[] = [
                    'name' => $date->format('D'),
                    'total' => $dailyTransactions
                ];
            }

            return [
                'transaksi_hari_ini' => [
                    'total' => $totalTransaksi,
                    'berhasil' => $transaksiBerhasil,
                    'ditolak' => $transaksiDitolak,
                    'nominal_total' => $nominalTotal
                ],
                'student' => [
                    'total' => $totalSiswa,
                    'aktif' => $siswaAktif,
                    'saldo_beredar' => $saldoBeredar
                ],
                'merchant' => [
                    'total' => $totalPedagang,
                    'aktif' => $pedagangAktif
                ],
                'transaksi_terakhir' => $transaksiTerakhir,
                'chart_data' => $chartData
            ];
        });

        return response()->json($data);
    }
}
