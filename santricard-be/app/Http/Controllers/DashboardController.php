<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Siswa;
use App\Models\Pedagang;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();

        $transaksisHariIni = Transaksi::whereDate('created_at', $today)->get();
        
        $totalTransaksi = $transaksisHariIni->count();
        $transaksiBerhasil = $transaksisHariIni->where('status', 'berhasil')->count();
        $transaksiDitolak = $transaksisHariIni->where('status', 'ditolak')->count();
        $nominalTotal = $transaksisHariIni->where('status', 'berhasil')->sum('nominal');

        $totalSiswa = Siswa::count();
        $siswaAktif = Siswa::where('aktif', true)->count();
        $saldoBeredar = Siswa::sum('saldo_virtual');

        $totalPedagang = Pedagang::count();
        // Asumsi pedagang aktif jika ada relasi user dan tidak diblokir, sementara anggap semua aktif
        $pedagangAktif = Pedagang::count(); 

        $transaksiTerakhir = Transaksi::with(['siswa', 'pedagang'])
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
            'siswa' => [
                'total' => $totalSiswa,
                'aktif' => $siswaAktif,
                'saldo_beredar' => $saldoBeredar
            ],
            'pedagang' => [
                'total' => $totalPedagang,
                'aktif' => $pedagangAktif
            ],
            'transaksi_terakhir' => $transaksiTerakhir
        ]);
    }
}
