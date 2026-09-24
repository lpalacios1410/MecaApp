import Link from "next/link";
import { connection } from "next/server";
import { Bike, Car, Activity } from "lucide-react";
import { getMechanicActiveOrders } from "@/lib/supabase/helpers";
import { OrderStatusBadge } from "@/components/dashboard/orders/order-status-badge";
import { OrderStatusActions } from "@/components/dashboard/orders/order-status-actions";
import { OrderStepsChecklist } from "@/components/dashboard/orders/order-steps-checklist";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MechanicActiveOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { items: orders, total, totalPages } = await getMechanicActiveOrders(
    page,
    6
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Órdenes Activas</h2>
        <p className="text-muted-foreground">
          Trabajos en curso: marca los puntos que ya completaste
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No tienes órdenes en curso
            </p>
            <Link href="/dashboard/mechanic/orders">
              <Button variant="outline">Ver solicitudes pendientes</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{order.plan_name}</CardTitle>
                      <CardDescription className="break-words">
                        Cliente:{" "}
                        {order.client?.full_name?.trim() ||
                          order.client?.email ||
                          "—"}
                      </CardDescription>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
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
                    {order.client_notes && (
                      <p className="rounded-md bg-muted p-2 break-words text-foreground">
                        Notas del cliente: {order.client_notes}
                      </p>
                    )}
                  </div>
                  <OrderStepsChecklist orderId={order.id} steps={order.steps} />
                  <OrderStatusActions
                    orderId={order.id}
                    status={order.status}
                    highlightComplete={
                      order.steps.length > 0 &&
                      order.steps.every((step) => step.done)
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {total} orden{total !== 1 ? "es" : ""} activa
              {total !== 1 ? "s" : ""} · página {page} de {totalPages}
            </p>
            <div className="flex justify-center gap-2">
              <Link
                href={`/dashboard/mechanic/orders/active?page=${page - 1}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Anterior
                </Button>
              </Link>
              <Link
                href={`/dashboard/mechanic/orders/active?page=${page + 1}`}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              >
                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                  Siguiente
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
