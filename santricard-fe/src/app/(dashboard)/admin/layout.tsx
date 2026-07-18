"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import TopHeader from "@/components/ui/TopHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col min-w-0 md:pl-64 transition-all duration-300">
        <TopHeader setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
