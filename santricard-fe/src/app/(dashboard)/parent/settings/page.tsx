"use client";

import { useState, useEffect } from "react";
import { UserCircle, Mail, Lock, Save, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios";

export default function ParentSettings() {
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // P2-D
  const [password, setPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUser = async () => {
    try {
      const res = await api.get("/user");
      setUser(res.data);
      setEmail(res.data.email || "");
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat profil.");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUser();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password && password !== passwordConfirm) {
      setErrorMsg("Konfirmasi password tidak cocok!");
      return;
    }

    if (email === user?.email && !password) {
      setSuccessMsg("Tidak ada perubahan untuk disimpan.");
      return;
    }

    // Tampilkan modal konfirmasi password
    setIsConfirmModalOpen(true);
  };

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMsg("Masukkan password saat ini untuk mengonfirmasi perubahan.");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = { 
        email,
        current_password: currentPassword
      };
      
      if (password) {
        payload.password = password;
      }
      const res = await api.patch("/user", payload);
      setSuccessMsg(res.data.message || "Profil berhasil diperbarui!");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
      setIsConfirmModalOpen(false);

      // Update local state
      if (res.data.user) {
        setUser(res.data.user);
        setEmail(res.data.user.email);
      }
    } catch (err: unknown) {
      setIsConfirmModalOpen(false);
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || "Terjadi kesalahan saat menyimpan pengaturan.");
      } else {
        setErrorMsg("Terjadi kesalahan sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-100 animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Pengaturan Akun</h2>
        <p className="text-gray-500 text-sm mt-1">
          Perbarui email dan password untuk akun Anda.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-emerald-50/50">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <UserCircle className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500 capitalize">Akun {user?.role === "parent" ? "Orang Tua" : user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{successMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ubah Password</h4>
              <p className="text-xs text-gray-500 mb-4">
                Biarkan kosong jika Anda tidak ingin mengubah password saat ini.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Password Baru
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Password</h3>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan password Anda saat ini untuk memverifikasi bahwa ini benar-benar Anda.
              </p>
              
              <form onSubmit={submitUpdate}>
                <div className="mb-6 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-10 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Password saat ini"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !currentPassword}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Konfirmasi"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
