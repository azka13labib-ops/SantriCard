"use client";

import { useState, useEffect } from "react";
import { FileText, Download, CheckCircle2, Plus, Loader2, X, Store, ArrowDownCircle } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";
import { SkeletonTable, SkeletonText } from "@/components/ui/skeleton";

interface Settlement {
  id: number;
  merchant: { nama_kantin: string } | null;
  nominal: number;
  status: string;
  catatan: string | null;
  created_at: string;
}

interface Merchant {
  id: number;
  nama_kantin: string;
  saldo_mengendap: number;
  terverifikasi: boolean;
}

export default function DataLaporan() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // P2-F: State untuk modal pencairan
  const [showModal, setShowModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [catatan, setCatatan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: "", text: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settlementRes, merchantRes] = await Promise.all([
        api.get("/settlement"),
        api.get("/merchant"),
      ]);
      setSettlements(settlementRes.data.data || settlementRes.data);
      // Filter hanya merchant yang punya saldo mengendap > 0 dan sudah terverifikasi
      const allMerchants: Merchant[] = merchantRes.data.data || merchantRes.data;
      setMerchants(allMerchants.filter((m) => m.terverifikasi && m.saldo_mengendap > 0));
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data laporan/pencairan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSettlement = async () => {
    if (!selectedMerchant) return;
    setIsProcessing(true);
    setModalMsg({ type: "", text: "" });
    try {
      await api.post("/settlement", {
        merchant_id: selectedMerchant.id,
        catatan: catatan || null,
      });
      setModalMsg({ type: "success", text: `Dana Rp ${selectedMerchant.saldo_mengendap.toLocaleString("id-ID")} dari ${selectedMerchant.nama_kantin} berhasil dicairkan!` });
      setTimeout(() => {
        setShowModal(false);
        setSelectedMerchant(null);
        setCatatan("");
        setModalMsg({ type: "", text: "" });
        fetchData();
      }, 1500);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setModalMsg({ type: "error", text: msg || "Gagal melakukan pencairan." });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "berhasil" || status === "selesai") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" /> Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
        Pending
      </span>
    );
  };

  if (loading && settlements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="w-full">
            <SkeletonText className="w-full max-w-xs h-8 mb-2" />
            <SkeletonText className="w-full max-w-sm h-4" />
          </div>
          <SkeletonText className="w-32 h-10 rounded-md mt-4 sm:mt-0" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-emerald-100">
            <SkeletonText className="w-32 h-4 mb-2" />
            <SkeletonText className="w-48 h-8" />
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-emerald-100">
            <SkeletonText className="w-32 h-4 mb-2" />
            <SkeletonText className="w-48 h-8" />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
          <SkeletonTable columns={5} rows={5} className="border-none shadow-none rounded-none" />
        </div>
      </div>
    );
  }

  const totalPencairan = settlements
    .filter((s) => s.status === "berhasil" || s.status === "selesai")
    .reduce((sum, item) => sum + Number(item.nominal), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Pencairan (Settlement)</h1>
          <p className="mt-2 text-sm text-gray-700">
            Riwayat penarikan dana dari saldo virtual kantin menjadi uang tunai.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 flex items-center gap-2">
          {/* P2-F: Tombol Cairkan Dana */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={merchants.length === 0}
            className="flex items-center gap-x-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownCircle className="h-4 w-4" />
            Cairkan Dana {merchants.length > 0 && `(${merchants.length})`}
          </button>
          <button
            type="button"
            className="flex items-center gap-x-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-emerald-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total Nilai Pencairan</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-emerald-600">
            Rp {totalPencairan.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-emerald-100">
          <dt className="truncate text-sm font-medium text-gray-500">Total Transaksi Settlement</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {settlements.length} Kali
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-amber-100">
          <dt className="truncate text-sm font-medium text-gray-500">Kantin Menunggu Pencairan</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-amber-600">
            {merchants.length} Kantin
          </dd>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        {settlements.length > 0 ? (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              <ul role="list" className="divide-y divide-gray-200">
                {settlements.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </p>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Kantin</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.merchant?.nama_kantin || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nominal</p>
                        <p className="text-sm font-bold text-gray-900">
                          Rp {item.nominal.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Catatan</p>
                        <p className="text-sm text-gray-600">{item.catatan || "-"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tanggal</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kantin</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Nominal</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {settlements.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {item.merchant?.nama_kantin || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-right text-gray-900">
                        Rp {item.nominal.toLocaleString("id-ID")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">{item.catatan || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Belum ada riwayat pencairan</h3>
              <p className="mt-1 text-sm text-gray-500">Pencairan dana kantin akan muncul di sini.</p>
            </div>
          )
        )}
      </div>

      {/* P2-F: Modal Cairkan Dana */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl">
                  <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Cairkan Dana Kantin</h2>
              </div>
              <button
                onClick={() => { setShowModal(false); setSelectedMerchant(null); setCatatan(""); setModalMsg({ type: "", text: "" }); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {merchants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Tidak ada kantin dengan saldo yang perlu dicairkan.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Pilih Kantin</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {merchants.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMerchant(m)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-colors ${
                          selectedMerchant?.id === m.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="text-sm font-medium text-gray-900">{m.nama_kantin}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                          Rp {m.saldo_mengendap.toLocaleString("id-ID")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMerchant && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-sm">
                    <p className="text-emerald-800 font-semibold">
                      Mencairkan <span className="text-emerald-600">Rp {selectedMerchant.saldo_mengendap.toLocaleString("id-ID")}</span> dari {selectedMerchant.nama_kantin}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Catatan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Transfer BCA 19 Juli 2026"
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm resize-none"
                  />
                </div>

                {modalMsg.text && (
                  <div className={`p-3 rounded-xl text-sm ${modalMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {modalMsg.text}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setSelectedMerchant(null); setCatatan(""); setModalMsg({ type: "", text: "" }); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSettlement}
                    disabled={!selectedMerchant || isProcessing}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Proses Pencairan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
