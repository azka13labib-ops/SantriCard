"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2, Wallet, History, AlertCircle, CheckCircle2,
  Lock, X, Users, ChevronRight, Eye, EyeOff,
} from "lucide-react";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { SkeletonCard, SkeletonList, SkeletonText } from "@/components/ui/skeleton";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Transaction {
  id: number;
  nominal: number;
  status: string;
  created_at: string;
  merchant?: { nama_kantin: string };
}

/** Data ringkas dari /user (tanpa sisa_limit_hari_ini) */
interface StudentSummary {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

/** Data saldo lengkap dari /student/{id}/saldo */
interface SaldoData {
  saldo: number;
  limit_harian: number;
  sisa_limit: number;
}

// â”€â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatRupiah(angka: number | null | undefined): string {
  const safe = typeof angka === "number" && isFinite(angka) ? angka : 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(safe);
}

function getInitials(nama: string) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ——— Component ————————————————————————————————————————————————————————————————————————————————————

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ——— Global state ———
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ——— Per-student state ———
  const [saldo, setSaldo] = useState<SaldoData | null>(null);
  const [histori, setHistori] = useState<Transaction[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ——— Account setup state ———
  const [perluSetup, setPerluSetup] = useState(() => {
    if (typeof window !== "undefined") {
      return Cookies.get("perlu_setup_akun") === "true";
    }
    return false;
  });
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");

  // ——— Step 1: fetch list of students ——————————————————————————————————————————————————————————
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get("/user");
        const rawStudents: StudentSummary[] = res.data.students ?? [];
        setStudents(rawStudents);

        if (rawStudents.length === 0) return;

        // Pick from URL query param first, else default to first student
        const qId = searchParams.get("siswa_id");
        const matched = rawStudents.find((s) => s.id === Number(qId));
        const initial = matched ?? rawStudents[0];
        setSelectedId(initial.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ——— Step 2: fetch detail whenever selected student changes —————————————————————————————————
  const fetchDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    setSaldo(null);
    setHistori([]);
    try {
      const [saldoRes, historiRes] = await Promise.all([
        api.get(`/student/${id}/saldo`),
        api.get(`/student/${id}/histori`),
      ]);
      setSaldo(saldoRes.data);
      setHistori(historiRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    // Sync URL query param
    const params = new URLSearchParams(searchParams.toString());
    params.set("siswa_id", String(selectedId));
    router.replace(`?${params.toString()}`, { scroll: false });
    
    // Defer the fetch to avoid cascading renders warning
    setTimeout(() => {
      fetchDetail(selectedId);
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // â”€â”€â”€ Password setup handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setSetupError("Password minimal 6 karakter"); return; }
    if (newPassword !== newPasswordConfirm) { setSetupError("Konfirmasi password tidak cocok!"); return; }
    setSetupLoading(true);
    setSetupError("");
    try {
      await api.post("/auth/setup-password", { password: newPassword });
      Cookies.set("perlu_setup_akun", "false");
      setPerluSetup(false);
      setShowSetupModal(false);
      alert("Password berhasil diatur! Anda kini bisa login menggunakan email dan password baru.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Terjadi kesalahan saat mengatur password.";
      setSetupError(msg);
    } finally {
      setSetupLoading(false);
    }
  };

  // â”€â”€â”€ Derived values (safe against undefined/null) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sisaLimit    = saldo?.sisa_limit   ?? 0;
  const limitHarian  = saldo?.limit_harian ?? 0;
  const saldoVirtual = saldo?.saldo        ?? 0;
  const limitPct     = limitHarian > 0
    ? Math.min(100, Math.max(0, (sisaLimit / limitHarian) * 100))
    : 0;

  const activeStudent = students.find((s) => s.id === selectedId);

  // ——— Loading state ————————————————————————————————————————————————————————————————————————————————
  if (loadingStudents) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <SkeletonText className="w-24" />
          <div className="flex gap-2">
            <SkeletonText className="h-10 w-32 rounded-xl" />
            <SkeletonText className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <SkeletonCard className="bg-emerald-600/50 border-none h-40" />
            <SkeletonCard className="h-40" />
          </div>
          <div className="md:col-span-7 lg:col-span-8">
            <SkeletonText className="w-48 mb-4 h-6" />
            <SkeletonList items={5} className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50" />
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 space-y-2">
        <AlertCircle className="w-12 h-12 text-gray-300" />
        <p>Belum ada data anak yang tertaut.</p>
      </div>
    );
  }

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* â”€â”€ Banner Setup Password â”€â”€ */}
      {perluSetup && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg shrink-0">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Akun Belum Diamankan</h4>
              <p className="text-amber-700 text-xs mt-0.5">
                Anda login sementara menggunakan NISN. Silakan atur password agar bisa login dengan aman menggunakan email.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSetupModal(true)}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Atur Password
          </button>
        </div>
      )}

      {/* â”€â”€ Child Selector (only if > 1 child) â”€â”€ */}
      {students.length > 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-700">Pilih Anak</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {students.map((s) => {
              const isActive = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {getInitials(s.nama)}
                  </div>
                  <div className="text-left">
                    <p className="leading-tight">{s.nama}</p>
                    <p className={`text-[10px] leading-tight ${isActive ? "text-emerald-100" : "text-gray-400"}`}>
                      Kelas {s.kelas}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-70 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* â”€â”€ Main Content Grid â”€â”€ */}
      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">

        {/* Left: Cards */}
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
                  <h2 className="text-sm font-semibold">{activeStudent?.nama ?? "â€”"}</h2>
                </div>
                <div className="bg-emerald-700/50 rounded-full px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border border-emerald-500/30">
                  KLS {activeStudent?.kelas ?? "â€”"}
                </div>
              </div>
              <div className="text-4xl font-bold mt-4 mb-1">
                {loadingDetail
                  ? <SkeletonText className="w-40 h-10 bg-emerald-700/50" />
                  : formatRupiah(saldoVirtual)
                }
              </div>
            </div>
          </div>

          {/* Limit Harian Card */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">Batas Jajan Hari Ini</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                Reset Tiap Malam
              </span>
            </div>

            {loadingDetail ? (
              <div className="space-y-2">
                <SkeletonText className="w-2/3 h-7" />
                <SkeletonText className="w-full h-2.5 rounded-full" />
                <SkeletonText className="w-1/2 h-3" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold text-gray-900">{formatRupiah(sisaLimit)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${limitPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Dari total jatah {formatRupiah(limitHarian)} / hari
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right: Histori */}
        <div className="md:col-span-7 lg:col-span-8">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-lg">Riwayat Jajan Terakhir</h3>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
            {loadingDetail ? (
              <SkeletonList items={4} className="divide-y divide-gray-50" />
            ) : histori.length > 0 ? (
              histori.map((trx) => (
                <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      trx.status === "berhasil" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                    }`}>
                      {trx.status === "berhasil"
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <AlertCircle className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {trx.merchant?.nama_kantin || "Kantin"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(trx.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      trx.status === "berhasil" ? "text-gray-900" : "text-gray-400 line-through"
                    }`}>
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

      {/* â”€â”€ Modal Setup Password â”€â”€ */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 relative">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Atur Password Baru</h3>
              <p className="text-sm text-gray-500 mt-1">
                Buat password untuk mengamankan akun Anda. Setelah ini, Anda dapat login menggunakan email.
              </p>
            </div>
            {setupError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {setupError}
              </div>
            )}
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ketik ulang password"
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={setupLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Password"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardOrtu() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
