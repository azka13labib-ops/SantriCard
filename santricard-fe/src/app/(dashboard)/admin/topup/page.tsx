"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import { SkeletonTable } from "@/components/ui/skeleton";

interface TopupData {
  id: number;
  student_id: number;
  nominal: number;
  metode: string;
  status: string;
  bukti_transfer: string | null;
  created_at: string;
  student: {
    nis: string;
    nama: string;
  };
}

export default function AdminTopupVerification() {
  const [top_ups, setTopups] = useState<TopupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchTopups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/topUp");
      setTopups(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pengajuan top-up.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchTopups();
    }, 0);
  }, []);

  const handleVerify = async (id: number, status: 'berhasil' | 'gagal') => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${status}?`)) return;

    try {
      await api.post(`/topUp/${id}/verifikasi`, { status });
      fetchTopups();
    } catch (err: unknown) {
      console.error(err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      alert(message || "Terjadi kesalahan saat memverifikasi.");
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Verifikasi Top-Up</h1>
          <p className="text-sm text-gray-500">Periksa bukti transfer dan setujui penambahan saldo santri.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabel Pengajuan */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6">
            <SkeletonTable columns={6} rows={5} className="border-none" />
          </div>
        ) : top_ups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Waktu</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Santri</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nominal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Metode</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {top_ups.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.student.nama}</div>
                      <div className="text-sm text-gray-500">{item.student.nis}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className="capitalize">{item.metode.replace('_', ' ')}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === 'pending'  ? 'badge-pending' :
                        item.status === 'berhasil' ? 'badge-success' : 'badge-error'
                      }`}>
                        {item.status === 'pending' ? 'Menunggu' : item.status === 'berhasil' ? 'Berhasil' : 'Ditolak'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 items-center">
                        {item.bukti_transfer && (
                          <button
                            onClick={() => setSelectedImage(`http://localhost:8000/storage/${item.bukti_transfer}`)}
                            className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded font-medium text-xs"
                          >
                            <Eye className="w-4 h-4" /> Bukti
                          </button>
                        )}
                        
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(item.id, 'berhasil')}
                              className="text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded flex items-center gap-1"
                              title="Terima"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVerify(item.id, 'gagal')}
                              className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded flex items-center gap-1"
                              title="Tolak"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm text-gray-500">Belum ada data pengajuan top-up.</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-gray-900/50 text-white rounded-full p-1 hover:bg-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage ?? undefined} alt="Bukti Transfer" className="max-w-full h-auto rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
