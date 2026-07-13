"use client";

import { Bell, Search } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Cari...
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Cari santri, riwayat transaksi..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Lihat notifikasi</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile & Logout */}
          <div className="flex items-center gap-x-4">
            <div className="hidden lg:flex lg:flex-col lg:items-end">
              <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                Administrator
              </span>
              <span className="text-xs leading-4 text-emerald-600">Admin Utama</span>
            </div>
            <img
              className="h-8 w-8 rounded-full bg-gray-50"
              src="https://ui-avatars.com/api/?name=Admin+Utama&background=10b981&color=fff"
              alt="Admin Profile"
            />
            <div className="ml-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
