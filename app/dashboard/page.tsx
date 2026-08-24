import Link from "next/link";
import { getUserProfile, getUserVehicles } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { Car, Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();
  const profile = await getUserProfile();
  const vehicles = await getUserVehicles();

  if (vehicles.length === 0) {
    redirect("/dashboard/vehicles/new");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido a MecaApp, {profile.full_name || "usuario"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mis Vehículos
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              Vehículo{vehicles.length !== 1 ? "s" : ""} registrado
              {vehicles.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipo de Usuario
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {profile.role === "mechanic" ? "Mecánico" : "Usuario"}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.email}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tus Vehículos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {vehicle.brand} {vehicle.model}
                </CardTitle>
                <CardDescription>{vehicle.plate}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Tipo: {vehicle.vehicle_type === "car" ? "Carro" : "Moto"}</p>
                  <p>Año: {vehicle.year}</p>
                  {vehicle.color && <p>Color: {vehicle.color}</p>}
                </div>
              </CardContent>
            </Card>
          ))}

          <Link href="/dashboard/vehicles/new">
            <Card className="border-dashed cursor-pointer hover:bg-accent/50 transition-colors h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px]">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Agregar Vehículo
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div>
        <Link href="/dashboard/plans">
          <Button size="lg">Ver Planes Disponibles</Button>
        </Link>
      </div>
    </div>
  );
}
