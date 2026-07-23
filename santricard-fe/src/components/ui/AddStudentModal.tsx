import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import CustomSelect from "./CustomSelect";
import SimpleSelect from "./SimpleSelect";

export default function AddStudentModal({ isOpen, onClose, onSiswaAdded }: { isOpen: boolean, onClose: () => void, onSiswaAdded: () => void }) {
  const [formData, setFormData] = useState({
    nis: "",
    nama: "",
    jenis_kelamin: "LK",
    kelas: "",
    limit_harian: "",
    parent_id: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ortuList, setOrtuList] = useState<{id: number, name: string, email: string}[]>([]);
  const [loadingOrtu, setLoadingOrtu] = useState(false);
  const [classList, setClassList] = useState<any[]>([]);
  const [loadingClass, setLoadingClass] = useState(false);

  const fetchParents = async () => {
    setLoadingOrtu(true);
    try {
      const res = await api.get('/users/parent');
      setOrtuList(res.data);
      if (res.data.length > 0 && !formData.parent_id) {
        setFormData(prev => ({ ...prev, parent_id: res.data[0].id.toString() }));
      }
    } catch (err) {
      console.error("Gagal memuat data orang tua", err);
    } finally {
      setLoadingOrtu(false);
    }
  };

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

  useEffect(() => {
    if (!isOpen) return;
    
    setFormData({ nis: "", nama: "", jenis_kelamin: "LK", kelas: "", limit_harian: "", parent_id: "" });
    setError("");
    fetchParents();
    fetchClasses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/student", {
        ...formData,
        limit_harian: parseInt(formData.limit_harian)
      });
      onSiswaAdded();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Gagal menambah student. Cek apakah NIS sudah dipakai.");
      } else {
        setError("Gagal menambah student. Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Tambah Data Santri Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Orang Tua / Wali</label>
            <SimpleSelect
              options={ortuList.map(parent => ({
                value: parent.id.toString(),
                label: `${parent.name} (${parent.email})`
              }))}
              value={formData.parent_id}
              onChange={(val) => setFormData({ ...formData, parent_id: val })}
              placeholder={loadingOrtu ? "Memuat data..." : "Pilih Orang Tua / Wali"}
              disabled={loadingOrtu}
            />
            {ortuList.length === 0 && !loadingOrtu && (
              <p className="mt-1 text-xs text-red-500">Tidak ada akun orang tua yang tersedia. Harap buat akun orang tua terlebih dahulu.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor Induk Santri (NIS)</label>
            <input
              type="text"
              required
              minLength={10}
              maxLength={10}
              pattern="\d{10}"
              title="NIS harus berupa 10 digit angka"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.nis}
              onChange={(e) => setFormData({ ...formData, nis: e.target.value.replace(/\D/g, '') })}
              placeholder="Misal: 10123984"
              inputMode="numeric"
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
              placeholder="Misal: Budi Santoso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <SimpleSelect
              options={[
                { value: 'LK', label: 'Laki-laki (LK)' },
                { value: 'PR', label: 'Perempuan (PR)' }
              ]}
              value={formData.jenis_kelamin}
              onChange={(val) => setFormData({ ...formData, jenis_kelamin: val })}
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
            <label className="block text-sm font-medium text-gray-700">Limit Jajan Harian (Rp)</label>
            <input
              type="number"
              required
              min="1000"
              max="20000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.limit_harian}
              onChange={(e) => setFormData({ ...formData, limit_harian: e.target.value })}
              placeholder="Misal: 25000"
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan & Buat Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
