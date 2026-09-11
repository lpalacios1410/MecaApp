import { connection } from "next/server";
import { Bike, Car, Inbox } from "lucide-react";
import { getMechanicOrders } from "@/lib/supabase/helpers";
import { OrderStatusBadge } from "@/components/dashboard/orders/order-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MechanicOrdersPage() {
  await connection();
  const orders = await getMechanicOrders();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Órdenes de Servicio</h2>
        <p className="text-muted-foreground">
          Solicitudes recibidas de tus clientes
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No tienes solicitudes todavía
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{order.plan_name}</CardTitle>
                    <CardDescription>
                      {order.client?.full_name?.trim() ||
                        order.client?.email ||
                        "Cliente"}
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
                  <p>
                    Solicitado:{" "}
                    {new Date(order.created_at).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {order.client_notes && (
                    <p className="rounded-md bg-muted p-2 text-foreground">
                      Notas del cliente: {order.client_notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
