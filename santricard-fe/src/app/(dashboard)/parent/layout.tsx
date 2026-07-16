"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, WalletCards, LogOut, UserCircle } from "lucide-react";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import SidebarParent from "@/components/ui/SidebarParent";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{name: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    api.get("/user").then(res => setUser(res.data)).catch(console.error);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
      Cookies.remove("token");
      window.location.href = "/login";
    } catch {
      Cookies.remove("token");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: "Monitoring Anak", icon: LayoutDashboard, href: "/parent" },
    { name: "Isi Saldo", icon: WalletCards, href: "/parent/topUp" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 pb-16 md:pb-0">
      
      {/* Desktop Sidebar */}
      <SidebarParent />

      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300 w-full">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 shrink-0 items-center justify-end bg-white px-6 shadow-sm border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <div className="h-8 w-8 overflow-hidden rounded-full bg-emerald-100 flex items-center justify-center">
               <UserCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="ml-2 rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-600 text-white shadow-md sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">SantriCard</h1>
            <p className="text-emerald-100 text-xs flex items-center gap-1">
              <UserCircle className="w-3 h-3" /> {user?.name || "Memuat..."}
            </p>
          </div>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-md md:max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title="Konfirmasi Keluar"
          message="Apakah Anda yakin ingin keluar dari aplikasi?"
          confirmText="Ya, Keluar"
          type="danger"
          isLoading={loading}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="w-full max-w-md mx-auto flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors ${
                  isActive ? "text-emerald-600" : "text-gray-400 hover:text-emerald-500"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
