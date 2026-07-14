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
    fetchData();
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
      setMessage({ type: "success", text: "Bukti terkirim! Menunggu verifikasi admin." });
      setNominal("");
      setFile(null);
      fetchData();
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
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-800 uppercase tracking-wider"><CheckCircle2 className="w-3 h-3"/> Berhasil</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-medium text-yellow-800 uppercase tracking-wider"><Clock className="w-3 h-3"/> Menunggu</span>;
      case "gagal":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-800 uppercase tracking-wider"><XCircle className="w-3 h-3"/> Ditolak</span>;
      default:
        return null;
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
    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 animate-in fade-in duration-300">
      
      {/* Left Column: Form Isi Saldo */}
      <div className="md:col-span-6 lg:col-span-5 rounded-3xl border border-emerald-100 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <QrCode className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Pembayaran QRIS</h2>
        </div>
        
        <div className="mb-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800">
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Scan QR di bawah pakai M-Banking / DANA.</li>
            <li>Masukkan nominal bebas (Min. 10.000).</li>
            <li>Screenshot bukti transfer berhasil.</li>
            <li>Upload pada form di bawah.</li>
          </ol>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center shadow-inner">
             <div className="w-40 h-40 bg-gray-50 flex items-center justify-center mb-2 rounded-xl border border-gray-100">
               <QrCode className="w-16 h-16 text-emerald-300" />
             </div>
             <p className="text-xs text-emerald-600 font-bold">QRIS DANA Bisnis</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-5 p-3 rounded-xl text-sm flex gap-2 items-start ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Nominal (Rp)</label>
            <input
              type="text"
              required
              placeholder="10.000"
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-lg py-3 px-4 font-bold text-gray-900"
              value={nominal}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setNominal(new Intl.NumberFormat("id-ID").format(Number(val)));
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Upload Bukti (Max 2MB)</label>
            <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                    <span>Pilih Gambar</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                {file && <p className="text-xs font-bold text-emerald-600 mt-2 truncate w-48 mx-auto">{file.name}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Bukti Pembayaran"}
          </button>
        </form>
      </div>

      {/* Right Column: Histori Topup */}
      <div className="md:col-span-6 lg:col-span-7">
        <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">Riwayat Pengajuan</h2>
        <div className="space-y-3 pb-8">
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-sm text-gray-500">Belum ada riwayat top-up.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-lg">{formatRupiah(item.nominal)}</p>
                  <p className="text-xs text-gray-500 font-medium">{new Date(item.created_at).toLocaleString("id-ID", { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
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
  );
}
