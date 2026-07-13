import LogoutButton from "@/components/ui/LogoutButton";

export const dynamic = 'force-dynamic';

export default function OrtuDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Orang Tua</h1>
          <p className="text-gray-600">Pantau pengeluaran dan histori jajan anak Anda di sini.</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
