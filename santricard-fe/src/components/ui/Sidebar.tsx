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
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-emerald-950 text-white shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0">
      {/* Logo Area */}
      <div className="flex h-16 shrink-0 items-center border-b border-emerald-800/50 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <span className="font-bold">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SantriCard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-800/80 text-emerald-100"
                  : "text-emerald-300 hover:bg-emerald-800/50 hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-emerald-100" : "text-emerald-400 group-hover:text-white"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area (e.g. settings or help) */}
      <div className="border-t border-emerald-800/50 p-4">
        <div className="rounded-lg bg-emerald-900/50 p-4 text-center">
          <p className="text-xs text-emerald-300">
            Sistem Informasi <br /> Keuangan Pesantren
          </p>
        </div>
      </div>
    </aside>
  );
}
