import { connection } from "next/server";

export default async function ClientOrdersPage() {
  await connection();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Orders</h2>
        <p className="text-muted-foreground">
          Track your service orders
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
