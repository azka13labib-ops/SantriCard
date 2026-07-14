"use client";

import { useState, useEffect } from "react";
import { Loader2, Receipt, Search, ArrowDownCircle } from "lucide-react";
import api from "@/lib/axios";

interface Transaksi {
  id: number;
  siswa_id: number;
  nominal: number;
  status: string;
  created_at: string;
  siswa: {
    nama: string;
  };
}

interface PedagangData {
  pedagang: string;
  saldo_mengendap: number;
  total_penjualan_30_hari: number;
  histori_transaksi: Transaksi[];
}

export default function PedagangHistoriPage() {
  const [data, setData] = useState<PedagangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPenjualan = async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/user");
      const pedagangId = userRes.data.pedagang?.id;
      
      if (pedagangId) {
        const res = await api.get(`/pedagang/${pedagangId}/penjualan`);
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchPenjualan();
    }, 0);
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const filteredHistori = data?.histori_transaksi.filter(t => 
    t.siswa.nama.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Group by date
  const groupedByDate = filteredHistori.reduce((acc, curr) => {
    const date = new Date(curr.created_at).toLocaleDateString('id-ID', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {} as Record<string, Transaksi[]>);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
      {/* Saldo Mengendap Card */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Receipt className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-emerald-100 font-medium text-sm">Total Saldo Terkumpul</p>
          <h2 className="text-4xl font-bold mt-1 mb-4">
            {formatRupiah(data?.saldo_mengendap || 0)}
          </h2>
          <div className="inline-flex items-center gap-2 bg-emerald-700/50 rounded-full px-3 py-1.5 text-xs">
            <ArrowDownCircle className="w-4 h-4 text-emerald-200" />
            <span>Pendapatan 30 hari: <strong>{formatRupiah(data?.total_penjualan_30_hari || 0)}</strong></span>
          </div>
        </div>
      </div>

      {/* Histori List */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-lg">Riwayat Penjualan</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari nama pembeli..." 
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {Object.keys(groupedByDate).length > 0 ? (
            Object.keys(groupedByDate).map(date => (
              <div key={date}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{date}</h4>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                  {groupedByDate[date].map(trx => (
                    <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">{trx.siswa.nama}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">+{formatRupiah(trx.nominal)}</p>
                        <p className="text-[10px] text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          {trx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl">
              <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Belum ada transaksi ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
