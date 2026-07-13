"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { LogOut, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // (Opsional) Beri tahu backend untuk menghapus token dari database
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Gagal logout di backend", error);
    } finally {
      // Yang paling penting: Hapus cookie di browser
      Cookies.remove("token");
      Cookies.remove("user_role");
      
      // Tendang ke halaman login dengan hard-reload agar cache Next.js bersih
      // sehingga tombol back browser tidak bisa melihat cache halaman sebelumnya.
      window.location.replace("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Keluar
    </button>
  );
}
