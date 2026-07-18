"use client";

import { useState, useEffect } from "react";
import { ReceiptText, Search } from "lucide-react";
import api from "@/lib/axios";
import { SkeletonTable, SkeletonText } from "@/components/ui/skeleton";

interface Transaction {
  id: number;
  student: { nama: string } | null;
  merchant: { nama_kantin: string } | null;
  nominal: number;
  status: string;
  created_at: string;
}

export default function TransaksiGlobal() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transaction");
      setTransactions(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data transaction.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchTransaction();
    }, 0);
  }, []);

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="w-full">
            <SkeletonText className="w-48 h-8 mb-2" />
            <SkeletonText className="w-full max-w-md h-4" />
          </div>
        </div>
        <SkeletonText className="w-full h-14 rounded-lg" />
        <div className="p-4 bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5">
          <SkeletonTable columns={6} rows={5} className="border-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Global</h1>
          <p className="mt-2 text-sm text-gray-700">
            Daftar seluruh riwayat mutasi dan transaction (100 terbaru) di lingkungan pesantren.
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
            placeholder="Cari berdasarkan ID Transaction atau Nama..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    ID Transaction
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
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      TRX-{trx.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(trx.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {trx.student?.nama || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {trx.merchant?.nama_kantin || '-'}
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
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <ReceiptText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada transaction</h3>
              <p className="mt-1 text-sm text-gray-500">Riwayat semua transaksi akan muncul di sini.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
