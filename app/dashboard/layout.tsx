import { Suspense } from "react";
import { connection } from "next/server";
import {
  getUserProfile,
  getUserVehiclesCount,
  type UserProfile,
} from "@/lib/supabase/helpers";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 flex items-center h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8">
      <div className="flex-1 space-y-1">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
    </header>
  );
}

async function DashboardHeader({ profile }: { profile: UserProfile }) {
  const vehicleCount = await getUserVehiclesCount();

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8">
      <div className="flex-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            Hola, {profile.full_name || profile.email}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.role === "mechanic" ? "Mecánico" : "Usuario"} •{" "}
            {vehicleCount} vehículo{vehicleCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </header>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const profile = await getUserProfile();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={profile.role} />

      <div className="md:pl-64 flex flex-col flex-1">
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader profile={profile} />
        </Suspense>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
