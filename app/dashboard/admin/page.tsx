import Link from "next/link";
import { Layers, ShieldCheck, Users } from "lucide-react";
import { getUserProfile } from "@/lib/supabase/helpers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connection } from "next/server";

export default async function AdminDashboardPage() {
  await connection();
  const profile = await getUserProfile();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Administración</h2>
        <p className="text-muted-foreground">
          Bienvenido, {profile.full_name || profile.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Catálogo de Planes
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Crea, edita y publica los planes que ven los clientes.
            </CardDescription>
            <Link href="/dashboard/admin/plans">
              <Button>Gestionar planes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gestión de Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Revisa los registrados y promueve mecánicos desde aquí.
            </CardDescription>
            <Link href="/dashboard/admin/users">
              <Button variant="outline">Ver usuarios</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rol</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">Administrador</div>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
