import LogoutButton from "@/components/ui/LogoutButton";

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-600">Selamat datang di Panel Admin SantriCard.</p>
        </div>
        <LogoutButton />
      </div>
      {/* Konten Dashboard Admin nanti di sini */}
    </div>
  );
}
