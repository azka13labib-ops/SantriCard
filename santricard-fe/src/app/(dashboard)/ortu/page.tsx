"use client";

import { useState, useEffect } from "react";
import { Loader2, Wallet, History, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";

interface Transaksi {
  id: number;
  nominal: number;
  status: string;
  created_at: string;
  pedagang?: {
    nama_kantin: string;
  };
}

interface Siswa {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  saldo_virtual: number;
  limit_harian: number;
  sisa_limit_hari_ini: number;
}

export default function DashboardOrtu() {
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [histori, setHistori] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);



  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user");
      const user = res.data;
      
      if (user.siswas && user.siswas.length > 0) {
        const currentSiswa = user.siswas[0];
        setSiswa(currentSiswa);
        
        const histRes = await api.get(`/siswa/${currentSiswa.id}/histori`);
        setHistori(histRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchData(), 0);
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!siswa) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 space-y-2">
        <AlertCircle className="w-12 h-12 text-gray-300" />
        <p>Belum ada data anak yang tertaut.</p>
      </div>
    );
  }

  const limitPercentage = Math.min(100, Math.max(0, (siswa.sisa_limit_hari_ini / siswa.limit_harian) * 100));

  return (
    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 animate-in fade-in duration-300">
      
      {/* Left Column: Cards */}
      <div className="md:col-span-5 lg:col-span-4 space-y-6">
        {/* Saldo Card */}
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 font-medium text-xs">Sisa Saldo Ananda</p>
                <h2 className="text-sm font-semibold">{siswa.nama}</h2>
              </div>
              <div className="bg-emerald-700/50 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border border-emerald-500/30">
                KLS {siswa.kelas}
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mt-4 mb-1">
              {formatRupiah(siswa.saldo_virtual)}
            </h2>
          </div>
        </div>

        {/* Limit Harian Card */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Batas Jajan Hari Ini</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Reset Tiap Malam</span>
          </div>
          
          <div className="flex justify-between items-end mb-2">
            <span className="text-2xl font-bold text-gray-900">{formatRupiah(siswa.sisa_limit_hari_ini)}</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${limitPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            Dari total jatah {formatRupiah(siswa.limit_harian)} / hari
          </p>
        </div>
      </div>

      {/* Right Column: Histori List */}
      <div className="md:col-span-7 lg:col-span-8">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-lg">Riwayat Jajan Terakhir</h3>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
          {histori.length > 0 ? (
            histori.map((trx) => (
              <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${trx.status === 'berhasil' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {trx.status === 'berhasil' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {trx.pedagang?.nama_kantin || "Kantin"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trx.status === 'berhasil' ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                    - {formatRupiah(trx.nominal)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Belum ada riwayat transaksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
