import Link from "next/link";
import { getUserProfile, getClientsWithVehicles } from "@/lib/supabase/helpers";
import { Users, Wrench, FileText } from "lucide-react";
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
  const profile = await getUserProfile();
  const { clients, total } = await getClientsWithVehicles();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mechanic Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome, {profile.full_name || profile.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              Client{total !== 1 ? "s" : ""} on the platform
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/mechanic/plans">
          <Button size="lg">
            <Wrench className="h-4 w-4 mr-2" />
            Manage Plans
          </Button>
        </Link>
        <Link href="/dashboard/mechanic/orders">
          <Button size="lg" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
