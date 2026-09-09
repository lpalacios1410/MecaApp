import Link from "next/link";
import { getVehicles, deleteVehicle } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { connection } from "next/server";

async function handleDeleteVehicle(formData: FormData) {
  "use server";
  const id = formData.get("vehicleId") as string;
  if (id) {
    await deleteVehicle(id);
  }
}

export default async function ClientVehiclesPage() {
  await connection();
  const vehicles = await getVehicles();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mis Vehículos</h2>
          <p className="text-muted-foreground">
            Gestiona tus vehículos registrados
          </p>
        </div>
        <Link href="/dashboard/client/vehicles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Vehículo
          </Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No tienes vehículos registrados
            </p>
            <Link href="/dashboard/client/vehicles/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primer Vehículo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription>{vehicle.plate}</CardDescription>
                  </div>
                  <form action={handleDeleteVehicle}>
                    <input type="hidden" name="vehicleId" value={vehicle.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Año: {vehicle.year}</p>
                  {vehicle.color && <p>Color: {vehicle.color}</p>}
                  {vehicle.notes && <p>Notas: {vehicle.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
