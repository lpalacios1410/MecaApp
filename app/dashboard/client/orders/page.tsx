import { connection } from "next/server";

export default async function ClientOrdersPage() {
  await connection();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mis Órdenes</h2>
        <p className="text-muted-foreground">
          Seguimiento de tus órdenes de servicio
        </p>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Vista de órdenes próximamente.
        </p>
      </div>
    </div>
  );
}
