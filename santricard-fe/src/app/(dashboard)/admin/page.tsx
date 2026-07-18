"use client";

import { useState, useEffect } from "react";
import { Users, Store, Wallet, ArrowUpRight } from "lucide-react";
import api from "@/lib/axios";
import { SkeletonKpiCard, SkeletonTable, SkeletonText } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  student: { total: number; aktif: number; saldo_beredar: number };
  merchant: { total: number; aktif: number };
  transaksi_hari_ini: { total: number; berhasil: number; ditolak: number; nominal_total: number };
  chart_data: Array<{ name: string; total: number }>;
  transaksi_terakhir: Array<{
    id: number;
    student: { nama: string } | null;
    merchant: { nama_kantin: string } | null;
    nominal: number;
    created_at: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-full">
          <SkeletonText className="w-48 h-8 mb-2" />
          <SkeletonText className="w-full max-w-sm h-4" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
        </div>
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <SkeletonText className="w-full h-64" />
        </div>
        <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <SkeletonText className="w-40 h-6" />
          </div>
          <SkeletonTable columns={6} rows={5} className="border-none shadow-none rounded-none" />
        </div>
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
    { title: "Total Student", value: data.student.total, icon: Users, trend: data.student.aktif + " Aktif", trendUp: true },
    { title: "Total Kantin", value: data.merchant.total, icon: Store, trend: data.merchant.aktif + " Aktif", trendUp: true },
    { 
      title: "Saldo Beredar", 
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.student.saldo_beredar), 
      icon: Wallet, 
      trend: "Total", 
      trendUp: true 
    },
    { 
      title: "Transaction Hari Ini", 
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
            <dd className="ml-16 flex flex-wrap items-baseline gap-x-2 pb-1">
              <p className="text-2xl font-semibold text-gray-900 break-all">{item.value}</p>
              <p className="flex items-baseline text-sm font-semibold text-emerald-600">
                <span className="sr-only"> Detail: </span>
                {item.trend}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">Grafik Transaction 7 Hari Terakhir</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chart_data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `Rp ${value / 1000}K`}
              />
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Transaction Terkini */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Transaction Terkini</h3>
        </div>
        {data.transaksi_terakhir && data.transaksi_terakhir.length > 0 ? (
          <>
            {/* Mobile View (Cards) */}
            <div className="block sm:hidden">
              <ul role="list" className="divide-y divide-gray-200">
                {data.transaksi_terakhir.map((trx) => (
                  <li key={trx.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">TRX-{trx.id}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          trx.status === "berhasil" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {trx.status === "berhasil" ? "Berhasil" : "Gagal"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Student</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{trx.student?.nama || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kantin</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{trx.merchant?.nama_kantin || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nominal</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trx.nominal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Waktu</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ID Transaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student
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
                  {data.transaksi_terakhir.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">TRX-{trx.id}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.student?.nama || '-'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.merchant?.nama_kantin || '-'}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm text-gray-500">Belum ada transaction terkini</p>
          </div>
        )}
      </div>
    </div>
  );
}
