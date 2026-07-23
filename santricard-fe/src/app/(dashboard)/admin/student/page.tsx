"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, QrCode, Download, Upload } from "lucide-react";
import api from "@/lib/axios";
import { SkeletonTable } from "@/components/ui/skeleton";

import AddStudentModal from "@/components/ui/AddStudentModal";
import EditStudentModal from "@/components/ui/EditStudentModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import QRCodeModal from "@/components/ui/QRCodeModal";
import ImportExcelModal from "@/components/ui/ImportExcelModal";

interface Student {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  saldo_virtual: number;
  limit_harian: number;
  aktif: boolean;
  jenis_kelamin: string;
  card: { status_aktif: boolean; qr_code_hash: string } | null;
  parent: { id: number; name: string; email: string } | null;
}

export default function DataSiswa() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [siswaToDelete, setSiswaToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'LK' | 'PR'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(student => {
    const matchesTab = activeTab === 'ALL' || student.jenis_kelamin === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = student.nama.toLowerCase().includes(searchLower) || student.nis.toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student");
      setStudents(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data student.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchStudent();
    }, 0);
  }, []);

  const handleNonaktifkan = async () => {
    if (!siswaToDelete) return;
    try {
      await api.delete(`/student/${siswaToDelete}`);
      fetchStudent();
      setIsDeleteModalOpen(false);
      setSiswaToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Gagal menonaktifkan student.");
    }
  };
  const handleExport = async () => {
    try {
      const response = await api.get("/student/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Gagal melakukan export", error);
      alert("Gagal melakukan export data. Silakan coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Student</h1>
          <p className="text-sm text-gray-500 max-w-xl">Kelola data santri, limit harian, dan card RFID mereka.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex sm:flex-none gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-x-2 rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Tambah Student
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabel Data Student */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`${activeTab === 'ALL' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('LK')}
              className={`${activeTab === 'LK' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Santri Laki-laki
            </button>
            <button
              onClick={() => setActiveTab('PR')}
              className={`${activeTab === 'PR' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Santri Perempuan
            </button>
          </nav>
        </div>
        <div className="border-b border-gray-200 px-6 py-4 flex gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIS atau Nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-9 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-6">
            <SkeletonTable columns={6} rows={6} className="border-none" />
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
                    Orang Tua
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
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{student.nama}</div>
                        <div className="text-sm text-gray-500">NIS: {student.nis}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {student.parent ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.parent.name}</div>
                            <div className="text-xs text-gray-400">{student.parent.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {student.kelas}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(student.saldo_virtual)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(student.limit_harian)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {student.card?.status_aktif && student.aktif ? (
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
                              setSelectedSiswa(student);
                              setIsQrModalOpen(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-900" 
                            title="Lihat QR Code"
                          >
                            <QrCode className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedSiswa(student);
                              setIsEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900" 
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSiswaToDelete(student.id);
                              setIsDeleteModalOpen(true);
                            }}
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
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data student yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSiswaAdded={fetchStudent} 
      />
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchStudent();
          alert("Data siswa berhasil diimport!");
        }}
        endpoint="/student/import"
      />
      <EditStudentModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSiswa(null);
        }} 
        onSiswaUpdated={fetchStudent}
        siswaData={selectedSiswa}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSiswaToDelete(null);
        }}
        onConfirm={handleNonaktifkan}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menonaktifkan akun student ini? Aksi ini akan memutuskan koneksi RFID."
        confirmText="Ya, Hapus"
        type="danger"
      />
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setSelectedSiswa(null);
        }}
        siswaData={selectedSiswa}
      />
    </div>
  );
}
