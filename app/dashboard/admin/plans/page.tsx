import { connection } from "next/server";
import { getAllPlans, getPlanOrderCounts } from "@/lib/supabase/helpers";
import { PlansManager } from "@/components/dashboard/plans/plans-manager";

export default async function AdminPlansPage() {
  await connection();
  const [plans, countsResult] = await Promise.all([
    getAllPlans(),
    getPlanOrderCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Planes de Servicio</h2>
        <p className="text-muted-foreground">
          Crea, edita y gestiona los planes que verán los clientes
        </p>
      </div>

      {countsResult.error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          No se pudieron cargar los conteos de órdenes. Algunas acciones pueden
          estar limitadas temporalmente.
        </p>
      )}

      <PlansManager plans={plans} orderCounts={countsResult.counts} />
    </div>
  );
}
