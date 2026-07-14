"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, CheckCircle2, Clock, XCircle, AlertCircle, QrCode } from "lucide-react";
import api from "@/lib/axios";

interface Siswa {
  id: number;
  nama: string;
}

interface TopupHistory {
  id: number;
  nominal: number;
  metode: string;
  status: string;
  created_at: string;
}

export default function OrtuTopupPage() {
  const [loading, setLoading] = useState(true);
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [history, setHistory] = useState<TopupHistory[]>([]);
  
  const [nominal, setNominal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/user");
      const user = userRes.data;
      
      if (user.siswas && user.siswas.length > 0) {
        const currentSiswa = user.siswas[0];
        setSiswa(currentSiswa);
        
        // Fetch topup history for this siswa
        const historyRes = await api.get(`/siswa/${currentSiswa.id}/topup`);
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 0);
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswa) return;
    if (!file) {
      setMessage({ type: "error", text: "Mohon unggah bukti transfer/pembayaran." });
      return;
    }

    const numNominal = Number(nominal.replace(/\D/g, ""));
    if (numNominal < 10000) {
      setMessage({ type: "error", text: "Minimal top-up adalah Rp 10.000." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("nominal", numNominal.toString());
    formData.append("metode", "qris_statis");
    formData.append("bukti_transfer", file);

    try {
      await api.post(`/siswa/${siswa.id}/topup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage({ type: "success", text: "Berhasil! Bukti transfer telah dikirim dan menunggu verifikasi admin." });
      setNominal("");
      setFile(null);
      fetchData(); // refresh history
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "Gagal mengirim pengajuan top-up." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "berhasil":
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><CheckCircle2 className="w-3 h-3"/> Berhasil</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"><Clock className="w-3 h-3"/> Menunggu</span>;
      case "gagal":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"><XCircle className="w-3 h-3"/> Ditolak</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Isi Saldo (Top-Up)</h1>
        {siswa && (
          <p className="text-gray-500">
            Kirimkan uang saku untuk <span className="font-semibold text-gray-700">{siswa.nama}</span> melalui QRIS DANA Bisnis.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Isi Saldo */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-sky-600" />
            Langkah Pembayaran
          </h2>
          
          <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-100 text-sm text-sky-800">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Scan kode QRIS di bawah ini menggunakan aplikasi M-Banking atau E-Wallet Anda (DANA, OVO, Gopay, dll).</li>
              <li>Masukkan nominal yang diinginkan.</li>
              <li>Screenshot/simpan bukti transfer berhasil.</li>
              <li>Upload bukti tersebut pada form di bawah.</li>
            </ol>
          </div>

          <div className="mb-6 flex justify-center">
            {/* TODO: Ganti src dengan gambar QRIS DANA Bisnis yang sebenarnya */}
            <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center">
               {/* Placeholder QRIS Image */}
               <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mb-2">
                 <QrCode className="w-16 h-16 text-gray-400" />
               </div>
               <p className="text-xs text-gray-500 font-medium">QRIS DANA Bisnis Pesantren</p>
            </div>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-md text-sm flex gap-2 items-start ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nominal Top-Up</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="0"
                  className="block w-full rounded-md border-gray-300 pl-9 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm border py-2 text-gray-900"
                  value={nominal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setNominal(new Intl.NumberFormat("id-ID").format(Number(val)));
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Bukti Transfer</label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:text-sky-500">
                      <span>Pilih file gambar</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max. 2MB)</p>
                  {file && <p className="text-sm font-medium text-sky-600 mt-2">{file.name}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Bukti Pembayaran"}
            </button>
          </form>
        </div>

        {/* Histori Topup */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Pengajuan Top-Up</h2>
          <div className="overflow-y-auto max-h-[600px] pr-2 space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada riwayat top-up.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{formatRupiah(item.nominal)}</p>
                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
