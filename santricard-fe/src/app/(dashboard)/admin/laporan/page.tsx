"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Download, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";

interface Settlement {
  id: number;
  pedagang: { nama_kantin: string } | null;
  nominal: number;
  status: string;
  catatan: string | null;
  created_at: string;
}

export default function DataLaporan() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSettlement = async () => {
    try {
      setLoading(true);
      const res = await api.get("/settlement");
      setSettlements(res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data laporan/pencairan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchSettlement();
    }, 0);
  }, []);

  if (loading && settlements.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const totalPencairan = settlements.reduce((sum, item) => sum + Number(item.nominal), 0);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Pencairan (Settlement)</h1>
          <p className="mt-2 text-sm text-gray-700">
            Riwayat penarikan dana dari saldo virtual kantin menjadi uang tunai.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-emerald-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total Nilai Pencairan</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-emerald-600">
            Rp {totalPencairan.toLocaleString('id-ID')}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-emerald-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total Transaksi Settlement</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {settlements.length} Kali
          </dd>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Tanggal Pencairan
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Kantin
              </th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                Nominal
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {settlements.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {item.pedagang?.nama_kantin || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-right text-gray-900">
                  Rp {item.nominal.toLocaleString('id-ID')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    <CheckCircle2 className="h-3 w-3" />
                    {item.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {item.catatan || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {settlements.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada riwayat pencairan</h3>
            <p className="mt-1 text-sm text-gray-500">Pencairan dana kantin akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
