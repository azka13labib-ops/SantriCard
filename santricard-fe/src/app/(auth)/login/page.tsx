"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import api from "@/lib/axios";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      const cookieOptions = rememberMe ? { expires: 7 } : {};
      Cookies.set("token", token, cookieOptions);
      Cookies.set("user_role", user.role, cookieOptions);

      if (user.role === "admin") {
        router.replace("/admin");
      } else if (user.role === "pedagang") {
        router.replace("/pedagang");
      } else if (user.role === "ortu") {
        router.replace("/ortu");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(err.response.data.message || "Validasi gagal. Cek email dan password Anda.");
      } else if (err.response?.status === 401) {
        setError("Email atau Password salah!");
      } else {
        setError("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* KIRI - FOTO (Tersembunyi di Mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/assets/download (4).jpg"
          alt="SantriCard Banner"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply" />
        <div className="absolute bottom-12 left-12 text-white">
          <h2 className="mb-2 text-4xl font-bold leading-tight">
            Membangun <br /> Ekosistem Digital <br /> Pondok Pesantren
          </h2>
          <p className="text-emerald-50">Cepat, Aman, dan Transparan dengan SantriCard.</p>
        </div>
      </div>

      {/* KANAN - FORM LOGIN */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Header */}
          <div className="mb-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang</h1>
            <p className="mt-2 text-sm text-gray-500">
              Silakan login ke akun SantriCard Anda untuk melanjutkan.
            </p>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  placeholder="admin@santricard.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat Saya
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Lupa password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
