"use client";

import { useState, useEffect } from "react";
import { ReceiptText, Search, Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface Transaksi {
  id: number;
  siswa: { nama: string } | null;
  pedagang: { nama_kantin: string } | null;
  nominal: number;
  status: string;
  created_at: string;
}

export default function TransaksiGlobal() {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transaksi");
      setTransaksis(res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data transaksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, []);

  if (loading && transaksis.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi Global</h1>
          <p className="mt-2 text-sm text-gray-700">
            Daftar seluruh riwayat mutasi dan transaksi (100 terbaru) di lingkungan pesantren.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            placeholder="Cari berdasarkan ID Transaksi atau Nama..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                ID Transaksi
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Waktu
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Santri (Pembeli)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Kantin (Tujuan)
              </th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                Nominal
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transaksis.map((trx) => (
              <tr key={trx.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  TRX-{trx.id}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(trx.created_at).toLocaleString('id-ID')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {trx.siswa?.nama || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {trx.pedagang?.nama_kantin || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-right text-gray-900">
                  Rp {trx.nominal.toLocaleString('id-ID')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    trx.status === 'berhasil' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {trx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transaksis.length === 0 && !loading && (
          <div className="text-center py-12">
            <ReceiptText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada transaksi</h3>
            <p className="mt-1 text-sm text-gray-500">Arus kas mutasi akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
