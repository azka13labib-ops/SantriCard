"use client";

import { useState } from "react";
import { Upload, X, Loader2, FileSpreadsheet } from "lucide-react";
import api from "@/lib/axios";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  endpoint: string;
}

export default function ImportExcelModal({ isOpen, onClose, onSuccess, endpoint }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Pilih file Excel terlebih dahulu");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess();
      onClose();
      setFile(null);
    } catch (err) {
      if (err instanceof Error) {
        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message || "Gagal mengimport data");
      } else {
        setError("Gagal mengimport data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Import Data via Excel</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-colors hover:border-brand-500 bg-slate-50">
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
              <FileSpreadsheet className="mb-4 h-12 w-12 text-slate-400" />
              <span className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Klik untuk memilih file
              </span>
              <span className="mt-1 text-xs text-slate-500">
                {file ? file.name : "Format yang didukung: .xlsx, .xls, .csv"}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
