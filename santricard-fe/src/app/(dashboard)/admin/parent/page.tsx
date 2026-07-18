"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Edit, Trash2, X, Users } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import { SkeletonTable, SkeletonText } from "@/components/ui/skeleton";

import AddParentModal from "@/components/ui/AddParentModal";
import EditParentModal from "@/components/ui/EditParentModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Student {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  aktif: boolean;
}

interface Ortu {
  id: number;
  name: string;
  email: string;
  students_count: number;
}

export default function DataOrtu() {
  const [parents, setParents] = useState<Ortu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrtu, setSelectedOrtu] = useState<Ortu | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ortuToDelete, setOrtuToDelete] = useState<number | null>(null);

  // State for children modal
  const [isChildrenModalOpen, setIsChildrenModalOpen] = useState(false);
  const [childrenModalTitle, setChildrenModalTitle] = useState("");
  const [childrenList, setChildrenList] = useState<Student[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  const fetchParent = async () => {
    try {
      setLoading(true);
      const response = await api.get("/parent");
      setParents(response.data.data || response.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data orang tua");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchParent(), 0);
  }, []);

  const handleDelete = async () => {
    if (!ortuToDelete) return;
    try {
      await api.delete(`/parent/${ortuToDelete}`);
      fetchParent();
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

  const handleShowChildren = async (parent: Ortu) => {
    setChildrenModalTitle(`Anak dari ${parent.name}`);
    setIsChildrenModalOpen(true);
    setChildrenLoading(true);
    setChildrenList([]);
    try {
      const res = await api.get("/student");
      const allStudents: Student[] = (res.data.data || res.data).data || (res.data.data || res.data);
      // Filter by parent_id using the full student data
      const resDetail = await api.get(`/parent/${parent.id}/students`).catch(() => null);
      if (resDetail) {
        setChildrenList(resDetail.data.data || resDetail.data);
      } else {
        // Fallback: filter from all students (if endpoint not available)
        setChildrenList(allStudents.filter((s: Student & { parent_id?: number }) => (s as { parent_id?: number }).parent_id === parent.id));
      }
    } catch {
      setChildrenList([]);
    } finally {
      setChildrenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SkeletonText className="w-48 h-8 mb-2" />
            <SkeletonText className="w-64 h-4" />
          </div>
          <SkeletonText className="w-32 h-10 rounded-lg" />
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 p-4">
            <SkeletonText className="w-64 h-10 rounded-lg" />
          </div>
          <SkeletonTable columns={4} rows={6} className="border-none" />
        </div>
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
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Belum ada data orang tua. Silakan tambah akun baru.
                    </td>
                  </tr>
                ) : (
                  parents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{parent.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{parent.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <button
                            onClick={() => handleShowChildren(parent)}
                            title="Klik untuk lihat daftar anak"
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Users className="h-3 w-3" />
                            {parent.students_count} Santri
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => {
                              setSelectedOrtu(parent);
                              setIsEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900" 
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setOrtuToDelete(parent.id);
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

      {/* Modal: Daftar Anak */}
      {isChildrenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{childrenModalTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Daftar santri yang terhubung</p>
              </div>
              <button
                onClick={() => setIsChildrenModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 max-h-80 overflow-y-auto">
              {childrenLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                </div>
              ) : childrenList.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Tidak ada data santri.</p>
              ) : (
                <ul className="space-y-2">
                  {childrenList.map((child) => (
                    <li key={child.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{child.nama}</div>
                        <div className="text-xs text-gray-500">NIS: {child.nis} · Kelas {child.kelas}</div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${child.aktif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {child.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-gray-100 px-6 py-3 text-right">
              <button
                onClick={() => setIsChildrenModalOpen(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <AddParentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={fetchParent} 
      />
      
      <EditParentModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrtu(null);
        }} 
        onUpdated={fetchParent}
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
        message="Apakah Anda yakin ingin menghapus akun orang tua ini? (Tidak bisa dihapus jika masih ada student yang terikat)."
        confirmText="Ya, Hapus"
        type="danger"
      />
    </div>
  );
}
