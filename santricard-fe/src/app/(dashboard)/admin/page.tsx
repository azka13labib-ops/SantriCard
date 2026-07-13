"use client";

import { useState, useEffect } from "react";
import { Users, Store, Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface DashboardData {
  siswa: { total: number; aktif: number; saldo_beredar: number };
  pedagang: { total: number; aktif: number };
  transaksi_hari_ini: { total: number; berhasil: number; ditolak: number; nominal_total: number };
  transaksi_terakhir: Array<{
    id: number;
    siswa: { nama: string } | null;
    pedagang: { nama_kantin: string } | null;
    nominal: number;
    created_at: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard", err);
      setError("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const kpiData = [
    { title: "Total Siswa", value: data.siswa.total, icon: Users, trend: data.siswa.aktif + " Aktif", trendUp: true },
    { title: "Total Kantin", value: data.pedagang.total, icon: Store, trend: data.pedagang.aktif + " Aktif", trendUp: true },
    { 
      title: "Saldo Beredar", 
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.siswa.saldo_beredar), 
      icon: Wallet, 
      trend: "Total", 
      trendUp: true 
    },
    { 
      title: "Transaksi Hari Ini", 
      value: data.transaksi_hari_ini.total, 
      icon: ArrowUpRight, 
      trend: data.transaksi_hari_ini.berhasil + " Berhasil", 
      trendUp: true 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ikhtisar Dashboard</h1>
        <p className="text-sm text-gray-500">Ringkasan aktivitas keuangan pesantren hari ini.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item) => (
          <div key={item.title} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <dt>
              <div className="absolute rounded-lg bg-emerald-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.title}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-emerald-600">
                <span className="sr-only"> Detail: </span>
                {item.trend}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Tabel Transaksi Terkini */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Transaksi Terkini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID Transaksi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Siswa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kantin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nominal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Waktu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.transaksi_terakhir && data.transaksi_terakhir.length > 0 ? (
                data.transaksi_terakhir.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">TRX-{trx.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.siswa?.nama || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.pedagang?.nama_kantin || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.nominal)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          trx.status === "berhasil" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {trx.status === "berhasil" ? "Berhasil" : "Gagal"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Belum ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
