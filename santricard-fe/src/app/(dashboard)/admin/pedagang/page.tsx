"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Store } from "lucide-react";
import api from "@/lib/axios";
import AddPedagangModal from "@/components/ui/AddPedagangModal";

interface Pedagang {
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
  const [pedagangs, setPedagangs] = useState<Pedagang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPedagang = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pedagang");
      setPedagangs(res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kantin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedagang();
  }, []);

  if (loading && pedagangs.length === 0) {
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
            {pedagangs.map((pedagang) => (
              <tr key={pedagang.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{pedagang.nama_kantin}</div>
                      <div className="text-gray-500">{pedagang.user?.name}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {pedagang.lokasi}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {pedagang.user?.email}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                  Rp {pedagang.saldo_mengendap.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {pedagangs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada data kantin</h3>
            <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan kantin baru.</p>
          </div>
        )}
      </div>

      <AddPedagangModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPedagangAdded={fetchPedagang} 
      />
    </div>
  );
}
