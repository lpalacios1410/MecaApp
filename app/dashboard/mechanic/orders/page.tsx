import { connection } from "next/server";

export default async function MechanicOrdersPage() {
  await connection();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Service Orders</h2>
        <p className="text-muted-foreground">
          View and manage incoming service orders
        </p>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Orders view coming soon.
        </p>
      </div>
    </div>
  );
}
