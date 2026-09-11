import { connection } from "next/server";
import { getAllPlans, getPlanOrderCounts } from "@/lib/supabase/helpers";
import { MechanicPlansManager } from "@/components/dashboard/plans/mechanic-plans-manager";

export default async function MechanicPlansPage() {
  await connection();
  const [plans, orderCounts] = await Promise.all([
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

      <MechanicPlansManager plans={plans} orderCounts={orderCounts} />
    </div>
  );
}
