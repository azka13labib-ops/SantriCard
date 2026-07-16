import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import ConfirmModal from "./ConfirmModal";

export default function EditOrtuModal({ 
  isOpen, 
  onClose, 
  onUpdated, 
  ortuData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onUpdated: () => void, 
  ortuData: { id: number, name: string, email: string } | null 
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (ortuData && isOpen) {
      void (async () => {
        setFormData({
          name: ortuData.name,
          email: ortuData.email,
          password: ""
        });
        setError("");
      })();
    }
  }, [ortuData, isOpen]);

  if (!isOpen || !ortuData) return null;

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // If password is empty, don't send it
      const payload: Record<string, string> = {
        name: formData.name,
        email: formData.email
      };
      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await api.patch(`/ortu/${ortuData.id}`, payload);
      setIsConfirmOpen(false);
      onUpdated();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      setIsConfirmOpen(false);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Gagal mengupdate data.");
      } else {
        setError("Gagal mengupdate data.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Akun Orang Tua</h2>
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
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border border-gray-300"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Untuk Login)</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border border-gray-300"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru <span className="text-gray-400 font-normal">(Opsional)</span></label>
            <input
              type="password"
              minLength={6}
              className="mt-1 block w-full rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm text-black py-2 px-3 border border-gray-300"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Kosongkan jika tidak ingin mengubah"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Konfirmasi Perubahan"
        message="Apakah Anda yakin ingin menyimpan perubahan pada akun ini?"
        confirmText="Ya, Simpan"
        type="warning"
        isLoading={loading}
      />
    </div>
  );
}
