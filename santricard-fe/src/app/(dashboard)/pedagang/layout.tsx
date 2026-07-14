"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanLine, History, LogOut, UserCircle } from "lucide-react";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface UserData {
  name: string;
  pedagang?: {
    nama_kantin: string;
  };
}

export default function PedagangLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    api.get("/user").then(res => setUser(res.data)).catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      Cookies.remove("token");
      window.location.href = "/login";
    } catch (err) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
  };

  const navItems = [
    { name: "Kasir", icon: ScanLine, href: "/pedagang" },
    { name: "Riwayat", icon: History, href: "/pedagang/histori" },
  ];

  return (
    <div className="min-h-screen bg-gray-200 flex md:items-center md:justify-center md:p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* Mobile App Container (Acts like a phone frame on desktop) */}
      <div className="w-full md:max-w-[400px] md:h-[850px] md:max-h-[90vh] bg-gray-50 md:rounded-[2.5rem] md:shadow-2xl md:border-[12px] md:border-gray-900 flex flex-col relative overflow-hidden ring-1 ring-gray-900/5 min-h-screen md:min-h-0">
        
        {/* Top Header */}
        <header className="bg-emerald-600 text-white shadow-sm z-10 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">
              {user?.pedagang?.nama_kantin || "Kantin"}
            </h1>
            <p className="text-emerald-100 text-xs flex items-center gap-1 mt-0.5">
              <UserCircle className="w-3.5 h-3.5" /> {user?.name || "Memuat..."}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-inner"
            title="Keluar"
          >
            <LogOut className="w-5 h-5 text-emerald-50" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full p-5 overflow-y-auto pb-24 custom-scrollbar">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-20 pb-safe">
          <div className="w-full flex justify-around px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full py-3.5 gap-1.5 transition-colors relative ${
                    isActive ? "text-emerald-600" : "text-gray-400 hover:text-emerald-500"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-full"></div>
                  )}
                  <item.icon className={`w-6 h-6 ${isActive ? 'animate-bounce-slight' : ''}`} />
                  <span className="text-[11px] font-bold tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
