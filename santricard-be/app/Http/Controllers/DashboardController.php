<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Student;
use App\Models\Merchant;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();

        $transaksisHariIni = Transaction::whereDate('created_at', $today)->get();
        
        $totalTransaksi = $transaksisHariIni->count();
        $transaksiBerhasil = $transaksisHariIni->where('status', 'berhasil')->count();
        $transaksiDitolak = $transaksisHariIni->where('status', 'ditolak')->count();
        $nominalTotal = $transaksisHariIni->where('status', 'berhasil')->sum('nominal');

        $totalSiswa = Student::count();
        $siswaAktif = Student::where('aktif', true)->count();
        $saldoBeredar = Student::sum('saldo_virtual');

        $totalPedagang = Merchant::count();
        // Asumsi merchant aktif jika ada relasi user dan tidak diblokir, sementara anggap semua aktif
        $pedagangAktif = Merchant::count(); 

        $transaksiTerakhir = Transaction::with(['student', 'merchant'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
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
            'transaksi_terakhir' => $transaksiTerakhir
        ]);
    }
}
