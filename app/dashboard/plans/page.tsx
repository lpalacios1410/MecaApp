import { getUserVehicles } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { PlanCard } from "./plan-card";
import { connection } from "next/server";

const plansByType = {
  car: [
    {
      id: "car-basic",
      name: "Básico",
      price: 29.99,
      description: "Para mantenimiento preventivo",
      features: [
        "Cambio de aceite",
        "Frenos básicos",
        "Revisión general",
        "1 injerto gratuito",
      ],
    },
    {
      id: "car-medium",
      name: "Mediano",
      price: 49.99,
      description: "Cobertura intermedia completa",
      features: [
        "Todo lo del plan Básico",
        "Cambio de filtro de aire",
        "Alineación y balanceo",
        "Diagnóstico computarizado",
        "2 injertos gratuitos",
      ],
      popular: true,
    },
    {
      id: "car-large",
      name: "Grande",
      price: 79.99,
      description: "Cobertura premium completa",
      features: [
        "Todo lo del plan Mediano",
        "Cambio de llantas (1 par)",
        "Puesta a punto completa",
        "Servicio de grúa gratuito",
        "Injertos ilimitados",
        "Garantía extendida",
      ],
    },
  ],
  moto: [
    {
      id: "moto-basic",
      name: "Básico",
      price: 19.99,
      description: "Para mantenimiento básico",
      features: [
        "Cambio de aceite",
        "Ajuste de frenos",
        "Revisión general",
        "1 injerto gratuito",
      ],
    },
    {
      id: "moto-medium",
      name: "Mediano",
      price: 34.99,
      description: "Cobertura intermedia",
      features: [
        "Todo lo del plan Básico",
        "Cambio de filtro",
        "Ajuste de cadena",
        "Diagnóstico electrónico",
        "2 injertos gratuitos",
      ],
      popular: true,
    },
    {
      id: "moto-large",
      name: "Grande",
      price: 59.99,
      description: "Cobertura premium",
      features: [
        "Todo lo del plan Mediano",
        "Cambio de neumáticos",
        "Servicio de grúa",
        "Injertos ilimitados",
        "Garantía extendida",
      ],
    },
  ],
};

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const vehicles = await getUserVehicles();

  if (vehicles.length === 0) {
    redirect("/dashboard/vehicles/new");
  }

  const selectedVehicle = params.vehicleId
    ? vehicles.find((v) => v.id === params.vehicleId)
    : vehicles[0];

  if (!selectedVehicle) {
    redirect("/dashboard/vehicles");
  }

  const plans =
    plansByType[selectedVehicle.vehicle_type] || plansByType.car;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Planes Disponibles</h2>
        <p className="text-muted-foreground">
          Selecciona el mejor plan para tu{" "}
          {selectedVehicle.vehicle_type === "car" ? "carro" : "moto"}:{" "}
          <span className="font-medium">
            {selectedVehicle.brand} {selectedVehicle.model}
          </span>{" "}
          ({selectedVehicle.plate})
        </p>
      </div>

      {vehicles.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {vehicles.map((vehicle) => (
            <a
              key={vehicle.id}
              href={`/dashboard/plans?vehicleId=${vehicle.id}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                vehicle.id === selectedVehicle.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              {vehicle.brand} {vehicle.model} ({vehicle.plate})
            </a>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            vehicleType={selectedVehicle.vehicle_type}
          />
        ))}
      </div>
    </div>
  );
}
