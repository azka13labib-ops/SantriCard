import LogoutButton from "@/components/ui/LogoutButton";

export const dynamic = 'force-dynamic';

export default function PedagangDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mesin Kasir Kantin</h1>
          <p className="text-gray-600">Scan kartu santri untuk melakukan pembayaran.</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
