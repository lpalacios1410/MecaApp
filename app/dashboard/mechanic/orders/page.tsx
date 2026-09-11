import { connection } from "next/server";

export default async function MechanicOrdersPage() {
  await connection();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Órdenes de Servicio</h2>
        <p className="text-muted-foreground">
          Visualiza y gestiona las órdenes de servicio recibidas
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
