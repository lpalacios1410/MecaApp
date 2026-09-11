import Link from "next/link";
import {
  getUserProfile,
  getUserVehicles,
  getClientOrders,
} from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import {
  Bike,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  Inbox,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/dashboard/orders/order-status-badge";
import { connection } from "next/server";

export default async function ClientDashboardPage() {
  await connection();
  const [profile, vehicles, orders] = await Promise.all([
    getUserProfile(),
    getUserVehicles(),
    getClientOrders(),
  ]);

  if (vehicles.length === 0) {
    redirect("/dashboard/client/vehicles/new");
  }

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido, {profile.full_name || profile.email}
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
            <div className="text-2xl font-bold capitalize">Usuario</div>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/client/orders">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mis Órdenes
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pendiente{pendingOrders !== 1 ? "s" : ""} de{" "}
                {orders.length} solicitud{orders.length !== 1 ? "es" : ""}
              </p>
            </CardContent>
          </Card>
        </Link>
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
                  <p>Año: {vehicle.year}</p>
                  {vehicle.color && <p>Color: {vehicle.color}</p>}
                  {vehicle.notes && <p>Notas: {vehicle.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))}

          <Link href="/dashboard/client/vehicles">
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Últimas Órdenes</h3>
          {orders.length > 0 && (
            <Link
              href="/dashboard/client/orders"
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Inbox className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                No tienes solicitudes todavía
              </p>
              <Link href="/dashboard/client/request">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Solicitar Servicio
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.slice(0, 3).map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {order.plan_name}
                      </CardTitle>
                      <CardDescription>
                        Mecánico:{" "}
                        {order.mechanic?.full_name?.trim() ||
                          order.mechanic?.email ||
                          "—"}
                      </CardDescription>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      {order.vehicle_type === "motorcycle" ? (
                        <Bike className="h-4 w-4" />
                      ) : (
                        <Car className="h-4 w-4" />
                      )}
                      {order.vehicle
                        ? `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plate})`
                        : "Vehículo no disponible"}
                    </p>
                    <p>Precio: ${order.plan_price_usd} USD/mes</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/client/request">
          <Button size="lg">Solicitar Servicio</Button>
        </Link>
        <Link href="/dashboard/client/plans">
          <Button size="lg" variant="outline">
            Ver Planes
          </Button>
        </Link>
        <Link href="/dashboard/client/orders">
          <Button size="lg" variant="outline">
            <FileText className="h-4 w-4" />
            Ver Órdenes
          </Button>
        </Link>
      </div>
    </div>
  );
}
