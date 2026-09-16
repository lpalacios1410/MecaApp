import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Bike, Car, Plus } from "lucide-react";
import { getUserVehicles, getActivePlans } from "@/lib/supabase/helpers";
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
  if (!vehicleId || !vehicleType) {
    return;
  }
  const result = await updateVehicleType(vehicleId, vehicleType);
  if (result?.error) {
    redirect(`/dashboard/client/plans?err=${encodeURIComponent(result.error)}`);
  }
  redirect(
    `/dashboard/client/plans?msg=${encodeURIComponent("Vehículo clasificado correctamente")}`
  );
}

function FlashBanner({ message, error }: { message?: string; error?: string }) {
  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        {error}
      </div>
    );
  }
  if (message) {
    return (
      <div className="rounded-md border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-400">
        {message}
      </div>
    );
  }
  return null;
}

function PageHeader({ subtitle }: { subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Planes de Mantenimiento</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export default async function ClientPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string; err?: string }>;
}) {
  await connection();
  const { msg, err } = await searchParams;
  const [vehicles, plans] = await Promise.all([
    getUserVehicles(),
    getActivePlans(),
  ]);

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
        <FlashBanner message={msg} error={err} />
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

  const carPlans = plans.filter((p) => p.vehicleType === "car");
  const motoPlans = plans.filter((p) => p.vehicleType === "motorcycle");

  return (
    <div className="space-y-10">
      <PageHeader subtitle={subtitle} />
      <FlashBanner message={msg} error={err} />

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
