import Link from "next/link";
import {
  getUserProfile,
  getClientsCount,
  getMechanicOrdersStats,
} from "@/lib/supabase/helpers";
import { Users, FileText, ClipboardList, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connection } from "next/server";

export default async function MechanicDashboardPage() {
  await connection();
  const [profile, total, stats] = await Promise.all([
    getUserProfile(),
    getClientsCount(),
    getMechanicOrdersStats(),
  ]);
  const pendingOrders = stats.pending;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Mecánico</h2>
        <p className="text-muted-foreground">
          Bienvenido, {profile.full_name || profile.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Registrados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Cliente{total !== 1 ? "s" : ""} en la plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitudes de Servicio
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Pendiente{pendingOrders !== 1 ? "s" : ""} de {stats.total} solicitud
              {stats.total !== 1 ? "es" : ""}
            </p>
          </CardContent>
        </Card>
        <Link href="/dashboard/mechanic/orders/active">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Activas
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                En curso ahora mismo
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/mechanic/orders/active">
          <Button size="lg">
            <Activity className="h-4 w-4 mr-2" />
            Órdenes Activas
          </Button>
        </Link>
        <Link href="/dashboard/mechanic/orders">
          <Button size="lg" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Ver Órdenes
          </Button>
        </Link>
      </div>
    </div>
  );
}
