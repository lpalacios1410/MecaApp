import Link from "next/link";
import { connection } from "next/server";
import { Bike, Car, Plus } from "lucide-react";
import { getUserVehicles } from "@/lib/supabase/helpers";
import { SERVICE_PLANS } from "@/lib/plans-data";
import { updateVehicleType } from "../vehicles/actions";
import { PlanCard } from "@/components/dashboard/plans/plan-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function handleClassifyVehicle(formData: FormData) {
  "use server";
  const vehicleId = formData.get("vehicleId") as string;
  const vehicleType = formData.get("vehicleType") as string;
  if (vehicleId && vehicleType) {
    await updateVehicleType(vehicleId, vehicleType);
  }
}

function PageHeader({ subtitle }: { subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Planes de Mantenimiento</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export default async function ClientPlansPage() {
  await connection();
  const vehicles = await getUserVehicles();

  if (vehicles.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader subtitle="Planes diseñados para el cuidado de tu vehículo" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              Registra un vehículo para ver los planes disponibles para ti
            </p>
            <Link href="/dashboard/client/vehicles/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Vehículo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unclassified = vehicles.filter((v) => !v.vehicle_type);

  if (unclassified.length > 0) {
    return (
      <div className="space-y-8">
        <PageHeader subtitle="Clasifica tus vehículos para mostrarte los planes correctos" />
        <div className="grid gap-4 md:grid-cols-2">
          {unclassified.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {vehicle.brand} {vehicle.model}
                </CardTitle>
                <CardDescription>{vehicle.plate}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleClassifyVehicle} className="flex gap-3">
                  <input type="hidden" name="vehicleId" value={vehicle.id} />
                  <Button
                    type="submit"
                    name="vehicleType"
                    value="car"
                    variant="outline"
                    className="flex-1"
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Es un carro
                  </Button>
                  <Button
                    type="submit"
                    name="vehicleType"
                    value="motorcycle"
                    variant="outline"
                    className="flex-1"
                  >
                    <Bike className="mr-2 h-4 w-4" />
                    Es una moto
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasCar = vehicles.some((v) => v.vehicle_type === "car");
  const hasMoto = vehicles.some((v) => v.vehicle_type === "motorcycle");
  const showBadges = hasCar && hasMoto;

  const subtitle =
    hasCar && hasMoto
      ? "Planes para tus carros y motos"
      : hasMoto
        ? "Planes para tu moto"
        : "Planes para tu carro";

  const carPlans = SERVICE_PLANS.filter((p) => p.vehicleType === "car");
  const motoPlans = SERVICE_PLANS.filter((p) => p.vehicleType === "motorcycle");

  return (
    <div className="space-y-10">
      <PageHeader subtitle={subtitle} />

      {hasCar && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Car className="h-5 w-5 text-primary" />
            Carros
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {carPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} showVehicleBadge={showBadges} />
            ))}
          </div>
        </section>
      )}

      {hasMoto && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Bike className="h-5 w-5 text-primary" />
            Motos
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {motoPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} showVehicleBadge={showBadges} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
