"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";

import AddOrtuModal from "@/components/ui/AddOrtuModal";
import EditOrtuModal from "@/components/ui/EditOrtuModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Ortu {
  id: number;
  name: string;
  email: string;
  siswas_count: number;
}

export default function DataOrtu() {
  const [ortus, setOrtus] = useState<Ortu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrtu, setSelectedOrtu] = useState<Ortu | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ortuToDelete, setOrtuToDelete] = useState<number | null>(null);

  const fetchOrtu = async () => {
    try {
      setLoading(true);
      const response = await api.get("/ortu");
      setOrtus(response.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data orang tua");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchOrtu(), 0);
  }, []);

  const handleDelete = async () => {
    if (!ortuToDelete) return;
    try {
      await api.delete(`/ortu/${ortuToDelete}`);
      fetchOrtu();
      setIsDeleteModalOpen(false);
      setOrtuToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      alert(msg || "Gagal menghapus data.");
      setIsDeleteModalOpen(false);
      setOrtuToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Orang Tua</h1>
          <p className="text-sm text-gray-500">Kelola akun akses untuk aplikasi orang tua / wali santri.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Tambah Akun
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama orang tua..."
                className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nama Orang Tua
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Jumlah Anak
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ortus.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Belum ada data orang tua. Silakan tambah akun baru.
                    </td>
                  </tr>
                ) : (
                  ortus.map((ortu) => (
                    <tr key={ortu.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{ortu.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{ortu.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            {ortu.siswas_count} Santri
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setSelectedOrtu(ortu);
                              setIsEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900" 
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setOrtuToDelete(ortu.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900" 
                            title="Hapus"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddOrtuModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={fetchOrtu} 
      />
      
      <EditOrtuModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrtu(null);
        }} 
        onUpdated={fetchOrtu}
        ortuData={selectedOrtu}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOrtuToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus akun orang tua ini? (Tidak bisa dihapus jika masih ada siswa yang terikat)."
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
}
