import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";

export default function AddMerchantModal({ isOpen, onClose, onPedagangAdded }: { isOpen: boolean, onClose: () => void, onPedagangAdded: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nama_kantin: "",
    lokasi: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/merchant", formData);
      onPedagangAdded();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Gagal menambahkan kantin. Pastikan email belum terdaftar.");
      } else {
        setError("Gagal menambahkan kantin. Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Pendaftaran Kantin Baru</h2>
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
            <label className="block text-sm font-medium text-gray-700">Nama Pemilik Kantin</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Misal: Ibu Siti"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Kantin / Stand</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.nama_kantin}
              onChange={(e) => setFormData({ ...formData, nama_kantin: e.target.value })}
              placeholder="Misal: Kantin Berkah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lokasi / Kios</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              placeholder="Misal: Blok A1"
            />
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-3">Kredensial Login Merchant:</p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Akun</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Misal: kantin.siti@santricard.com"
              />
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimal 6 karakter"
              />
            </div>
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan Kantin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
