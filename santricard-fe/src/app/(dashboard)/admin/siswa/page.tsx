"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Edit, Trash2 } from "lucide-react";
import api from "@/lib/axios";

import AddSiswaModal from "@/components/ui/AddSiswaModal";
import EditSiswaModal from "@/components/ui/EditSiswaModal";

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  saldo_virtual: number;
  limit_harian: number;
  aktif: boolean;
  kartu: { status_aktif: boolean } | null;
}

export default function DataSiswa() {
  const [siswas, setSiswas] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const res = await api.get("/siswa");
      setSiswas(res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchSiswa();
    }, 0);
  }, []);

  const handleNonaktifkan = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan siswa ini?")) {
      try {
        await api.delete(`/siswa/${id}`);
        fetchSiswa();
      } catch (err) {
        console.error(err);
        alert("Gagal menonaktifkan siswa.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Siswa</h1>
          <p className="text-sm text-gray-500">Kelola data santri, limit harian, dan kartu RFID mereka.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-x-2 rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabel Data Siswa */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4 flex gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIS atau Nama..."
              className="block w-full rounded-md border-0 py-2 pl-9 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    NIS / Nama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kelas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Saldo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Limit Harian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status RFID
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {siswas.length > 0 ? (
                  siswas.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{siswa.nama}</div>
                        <div className="text-sm text-gray-500">NIS: {siswa.nis}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {siswa.kelas}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(siswa.saldo_virtual)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(siswa.limit_harian)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {siswa.kartu?.status_aktif && siswa.aktif ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Tidak Aktif
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setSelectedSiswa(siswa);
                              setIsEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900" 
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleNonaktifkan(siswa.id)}
                            className="text-red-600 hover:text-red-900" 
                            title="Nonaktifkan"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Belum ada data siswa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddSiswaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSiswaAdded={fetchSiswa} 
      />
      <EditSiswaModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSiswa(null);
        }} 
        onSiswaUpdated={fetchSiswa}
        siswaData={selectedSiswa}
      />
    </div>
  );
}
