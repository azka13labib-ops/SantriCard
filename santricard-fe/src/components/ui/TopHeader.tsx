"use client";

import { Bell } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function TopHeader({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b-2 border-emerald-500 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex-1">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-widest">
            SantriCard
          </p>
          <h2 className="text-sm font-semibold text-gray-800 leading-none mt-0.5">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <span className="sr-only">Lihat notifikasi</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile & Logout */}
          <div className="flex items-center gap-x-3">
            <div className="hidden lg:flex lg:flex-col lg:items-end">
              <span className="text-sm font-semibold leading-5 text-gray-800" aria-hidden="true">
                Administrator
              </span>
              <span className="text-xs leading-4 text-emerald-600 font-medium">Admin Utama</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm select-none">
              A
            </div>
            <div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
