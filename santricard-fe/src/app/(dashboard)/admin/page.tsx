import { Users, Store, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const kpiData = [
    { title: "Total Siswa", value: "1,240", icon: Users, trend: "+12", trendUp: true },
    { title: "Total Kantin", value: "24", icon: Store, trend: "+2", trendUp: true },
    { title: "Saldo Beredar", value: "Rp 45.200.000", icon: Wallet, trend: "-1.2%", trendUp: false },
    { title: "Transaksi Hari Ini", value: "850", icon: ArrowUpRight, trend: "+150", trendUp: true },
  ];

  const recentTransactions = [
    { id: "TRX-001", siswa: "Ahmad Dahlan", kantin: "Kantin Sehat Bu Siti", nominal: "Rp 15.000", waktu: "10:24 WIB", status: "Berhasil" },
    { id: "TRX-002", siswa: "Siti Aminah", kantin: "Koperasi Pondok", nominal: "Rp 25.000", waktu: "10:15 WIB", status: "Berhasil" },
    { id: "TRX-003", siswa: "Budi Santoso", kantin: "Kantin Kang Maman", nominal: "Rp 10.000", waktu: "09:55 WIB", status: "Berhasil" },
    { id: "TRX-004", siswa: "Aisyah Putri", kantin: "Toko Kitab", nominal: "Rp 45.000", waktu: "09:30 WIB", status: "Berhasil" },
    { id: "TRX-005", siswa: "Fathur Rahman", kantin: "Kantin Sehat Bu Siti", nominal: "Rp 8.000", waktu: "09:12 WIB", status: "Gagal" },
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
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.trendUp ? (
                  <ArrowUpRight className="h-4 w-4 shrink-0 self-center text-green-500" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 shrink-0 self-center text-red-500" aria-hidden="true" />
                )}
                <span className="sr-only"> {item.trendUp ? "Naik" : "Turun"} sebesar </span>
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
              {recentTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{trx.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.siswa}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.kantin}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">{trx.nominal}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{trx.waktu}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        trx.status === "Berhasil" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
