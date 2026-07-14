import SidebarOrtu from "@/components/ui/SidebarOrtu";
import TopHeader from "@/components/ui/TopHeader";

export default function OrtuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarOrtu />
      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
        <TopHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
