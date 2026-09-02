import { connection } from "next/server";

export default async function MechanicPlansPage() {
  await connection();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Service Plans</h2>
        <p className="text-muted-foreground">
          Manage your available service plans
        </p>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Plans management coming soon.
        </p>
      </div>
    </div>
  );
}
