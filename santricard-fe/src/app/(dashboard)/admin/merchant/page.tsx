"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Store } from "lucide-react";
import api from "@/lib/axios";
import AddMerchantModal from "@/components/ui/AddMerchantModal";

interface Merchant {
  id: number;
  nama_kantin: string;
  lokasi: string;
  saldo_mengendap: number;
  user: {
    name: string;
    email: string;
  };
}

export default function DataKantin() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMerchant = async () => {
    try {
      setLoading(true);
      const res = await api.get("/merchant");
      setMerchants(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kantin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchMerchant();
    }, 0);
  }, []);

  if (loading && merchants.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kantin</h1>
          <p className="mt-2 text-sm text-gray-700">
            Daftar seluruh kantin yang terdaftar di sistem SantriCard.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-x-2 rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Tambah Kantin
          </button>
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
            placeholder="Cari nama kantin..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Nama Kantin / Pemilik
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Lokasi
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Akun (Email)
              </th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                Saldo Mengendap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {merchants.map((merchant) => (
              <tr key={merchant.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{merchant.nama_kantin}</div>
                      <div className="text-gray-500">{merchant.user?.name}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {merchant.lokasi}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {merchant.user?.email}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                  Rp {merchant.saldo_mengendap.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {merchants.length === 0 && !loading && (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada data kantin</h3>
            <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan kantin baru.</p>
          </div>
        )}
      </div>

      <AddMerchantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPedagangAdded={fetchMerchant} 
      />
    </div>
  );
}
