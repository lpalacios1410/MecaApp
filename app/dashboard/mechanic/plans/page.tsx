import { connection } from "next/server";

export default async function MechanicPlansPage() {
  await connection();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Planes de Servicio</h2>
        <p className="text-muted-foreground">
          Gestiona tus planes de servicio disponibles
        </p>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Gestión de planes próximamente.
        </p>
      </div>
    </div>
  );
}
