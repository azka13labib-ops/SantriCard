"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { LogOut, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import ConfirmModal from "./ConfirmModal";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Gagal logout di backend", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("user_role");
      window.location.replace("/login");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
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

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmText="Ya, Keluar"
        type="danger"
        isLoading={loading}
      />
    </>
  );
}
