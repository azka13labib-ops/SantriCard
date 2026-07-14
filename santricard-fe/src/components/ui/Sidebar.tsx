"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Store, ReceiptText, FileText } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Data Siswa", icon: Users, href: "/admin/siswa" },
    { name: "Data Kantin", icon: Store, href: "/admin/pedagang" },
    { name: "Verifikasi Top-Up", icon: ReceiptText, href: "/admin/topup" },
    { name: "Transaksi", icon: ReceiptText, href: "/admin/transaksi" },
    { name: "Laporan", icon: FileText, href: "/admin/laporan" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex h-16 items-center px-6 border-b border-gray-100 bg-emerald-600">
        <h1 className="text-xl font-bold tracking-tight text-white">SantriCard</h1>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu Admin
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"
                }`}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
         <p className="text-xs text-center text-gray-500 font-medium">SantriCard &copy; 2026</p>
      </div>
    </aside>
  );
}
