import { getUserVehicles } from "@/lib/supabase/helpers";
import { connection } from "next/server";

export default async function ClientRequestPage() {
  await connection();
  const vehicles = await getUserVehicles();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Request Service</h2>
        <p className="text-muted-foreground">
          Request a service for your vehicle
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You need to register a vehicle first before requesting a service.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Service request form coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
