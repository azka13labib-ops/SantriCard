"use client";

import { useState, useEffect } from "react";
import { Wallet, History, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/axios";

interface Siswa {
  id: number;
  nama: string;
  nis: string;
  kelas: string;
}

interface SaldoData {
  siswa_id: number;
  nama: string;
  saldo: number;
  limit_harian: number;
  sisa_limit: number;
}

interface Transaksi {
  id: number;
  nominal: number;
  jenis: string;
  keterangan: string;
  created_at: string;
  pedagang: { nama_kantin: string } | null;
}

export default function OrtuDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [saldo, setSaldo] = useState<SaldoData | null>(null);
  const [histori, setHistori] = useState<Transaksi[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // 1. Get current logged in parent and their siswas
      const userRes = await api.get("/user");
      const user = userRes.data;
      
      if (!user.siswas || user.siswas.length === 0) {
        setError("Belum ada data siswa yang terkait dengan akun Anda.");
        setLoading(false);
        return;
      }
      
      // For now, we take the first child (if parent has multiple children, we could add a selector)
      const currentSiswa = user.siswas[0];
      setSiswa(currentSiswa);
      
      // 2. Get saldo and histori for this siswa
      const [saldoRes, historiRes] = await Promise.all([
        api.get(`/siswa/${currentSiswa.id}/saldo`),
        api.get(`/siswa/${currentSiswa.id}/histori`)
      ]);
      
      setSaldo(saldoRes.data);
      setHistori(historiRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat data. Pastikan Anda memiliki akses.");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Anak</h1>
        {siswa && (
          <p className="text-gray-500">
            Menampilkan data untuk ananda <span className="font-semibold text-gray-700">{siswa.nama}</span> (Kelas {siswa.kelas})
          </p>
        )}
      </div>

      {/* Saldo Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sky-100 font-medium">Sisa Saldo Virtual</p>
              <h3 className="text-3xl font-bold tracking-tight mt-1">
                {saldo ? formatRupiah(saldo.saldo) : "-"}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Batas Jajan Hari Ini</h3>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              Reset tiap malam
            </span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Sisa Limit</span>
              <span className="font-medium text-gray-900">{saldo ? formatRupiah(saldo.sisa_limit) : "-"}</span>
            </div>
            {saldo && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${
                    (saldo.sisa_limit / saldo.limit_harian) > 0.5 ? "bg-emerald-500" :
                    (saldo.sisa_limit / saldo.limit_harian) > 0.2 ? "bg-yellow-500" : "bg-red-500"
                  }`} 
                  style={{ width: `${Math.max(0, (saldo.sisa_limit / saldo.limit_harian) * 100)}%` }}
                ></div>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Dari total jatah {saldo ? formatRupiah(saldo.limit_harian) : "-"} / hari
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Jajan Terakhir (30 Hari)</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tempat / Kantin</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Keterangan</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {histori.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                histori.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(trx.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {trx.pedagang?.nama_kantin || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {trx.keterangan || "Jajan"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-right font-medium text-red-600">
                      - {formatRupiah(trx.nominal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
