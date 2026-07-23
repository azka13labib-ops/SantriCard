import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import CustomSelect from "./CustomSelect";
import ConfirmModal from "./ConfirmModal";

interface Student {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  limit_harian: number;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiswaUpdated: () => void;
  siswaData: Student | null;
}

export default function EditStudentModal({ isOpen, onClose, onSiswaUpdated, siswaData }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    nama: "",
    kelas: "",
    limit_harian: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [classList, setClassList] = useState<any[]>([]);
  const [loadingClass, setLoadingClass] = useState(false);

  useEffect(() => {
    if (isOpen && siswaData) {
      setFormData({
        nama: siswaData.nama,
        kelas: siswaData.kelas,
        limit_harian: siswaData.limit_harian.toString(),
      });
      setError("");

      const fetchClasses = async () => {
        try {
          setLoadingClass(true);
          const res = await api.get('/school-classes');
          setClassList(res.data);
        } catch (err: any) {
          console.error("Gagal mengambil data kelas:", err);
        } finally {
          setLoadingClass(false);
        }
      };
      fetchClasses();
    }
  }, [isOpen, siswaData]);

  if (!isOpen || !siswaData) return null;

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await api.patch(`/student/${siswaData.id}`, {
        ...formData,
        limit_harian: Number(formData.limit_harian)
      });
      setIsConfirmOpen(false);
      onSiswaUpdated();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Gagal mengupdate data student.");
      } else {
        setError("Gagal mengupdate data student. Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Data Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitClick} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">NIS (Tidak dapat diubah)</label>
            <input
              type="text"
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm text-gray-500 py-2 px-3 border cursor-not-allowed"
              value={siswaData.nis}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kelas</label>
            <CustomSelect
              options={classList}
              value={formData.kelas}
              onChange={(val) => setFormData({ ...formData, kelas: val })}
              placeholder={loadingClass ? "Memuat..." : "Pilih Kelas"}
              disabled={loadingClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Limit Jajan Harian (Maks. Rp 20.000)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.limit_harian}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (Number(val) <= 20000) {
                  setFormData({ ...formData, limit_harian: val });
                }
              }}
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Perubahan"
        message="Apakah Anda yakin ingin menyimpan perubahan data student ini?"
        confirmText="Ya, Simpan"
        type="warning"
        isLoading={loading}
      />
    </div>
  );
}
