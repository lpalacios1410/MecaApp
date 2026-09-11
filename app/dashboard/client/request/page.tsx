import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import {
  getUserVehicles,
  getMechanics,
  getActivePlans,
} from "@/lib/supabase/helpers";
import { ServiceRequestForm } from "@/components/dashboard/request/service-request-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientRequestPage() {
  await connection();
  const [vehicles, mechanics, plans] = await Promise.all([
    getUserVehicles(),
    getMechanics(),
    getActivePlans(),
  ]);

  const classifiedCount = vehicles.filter((v) => v.vehicle_type).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Solicitar Servicio</h2>
        <p className="text-muted-foreground">
          Solicita un plan de mantenimiento para tu vehículo
        </p>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              Necesitas registrar un vehículo primero antes de solicitar un
              servicio.
            </p>
            <Link href="/dashboard/client/vehicles/new">
              <Button>
                <Plus className="h-4 w-4" />
                Registrar Vehículo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : classifiedCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              Clasifica tus vehículos para poder solicitar un servicio.
            </p>
            <Link href="/dashboard/client/plans">
              <Button>Clasificar Vehículos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : mechanics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Todavía no hay mecánicos disponibles en la plataforma.
            </p>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Todavía no hay planes de mantenimiento disponibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ServiceRequestForm
          vehicles={vehicles}
          mechanics={mechanics}
          plans={plans}
        />
      )}
    </div>
  );
}
