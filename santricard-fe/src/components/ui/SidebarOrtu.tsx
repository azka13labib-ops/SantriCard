"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, WalletCards } from "lucide-react";

export default function SidebarOrtu() {
  const pathname = usePathname();

  const navItems = [
    { name: "Monitoring Anak", icon: LayoutDashboard, href: "/ortu" },
    { name: "Isi Saldo", icon: WalletCards, href: "/ortu/topup" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-full w-64 flex-col border-r border-emerald-700/50 bg-emerald-800 transition-transform md:flex shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
      <div className="flex h-16 items-center px-6 border-b border-emerald-700/50 bg-emerald-900/50">
        <h1 className="text-xl font-bold tracking-tight text-white">SantriCard</h1>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 custom-scrollbar">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/70">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600"
                  : "text-emerald-100 hover:bg-emerald-700/50 hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-emerald-300 group-hover:text-emerald-100"
                }`}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-emerald-700/50 bg-emerald-900/30">
         <p className="text-xs text-center text-emerald-400 font-medium">SantriCard &copy; 2026</p>
      </div>
    </aside>
  );
}
