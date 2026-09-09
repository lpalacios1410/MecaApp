import { getUserVehicles } from "@/lib/supabase/helpers";
import { connection } from "next/server";

export default async function ClientRequestPage() {
  await connection();
  const vehicles = await getUserVehicles();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Solicitar Servicio</h2>
        <p className="text-muted-foreground">
          Solicita un servicio para tu vehículo
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Necesitas registrar un vehículo primero antes de solicitar un servicio.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Formulario de solicitud de servicio próximamente.
          </p>
        </div>
      )}
    </div>
  );
}
