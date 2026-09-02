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

export default async function ClientDashboardPage() {
  await connection();
  const profile = await getUserProfile();
  const vehicles = await getUserVehicles();

  if (vehicles.length === 0) {
    redirect("/dashboard/client/vehicles");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Client Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome, {profile.full_name || profile.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered vehicle{vehicles.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Type
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">Client</div>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Vehicles</h3>
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
                  <p>
                    Type: {vehicle.vehicle_type === "car" ? "Car" : "Motorcycle"}
                  </p>
                  <p>Year: {vehicle.year}</p>
                  {vehicle.color && <p>Color: {vehicle.color}</p>}
                </div>
              </CardContent>
            </Card>
          ))}

          <Link href="/dashboard/client/vehicles">
            <Card className="border-dashed cursor-pointer hover:bg-accent/50 transition-colors h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[140px]">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Add Vehicle
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div>
        <Link href="/dashboard/client/request">
          <Button size="lg">Request Service</Button>
        </Link>
      </div>
    </div>
  );
}
