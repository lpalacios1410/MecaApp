import {
  getUserProfile,
  type UserProfile,
} from "@/lib/supabase/helpers";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { connection } from "next/server";

function DashboardHeader({ profile }: { profile: UserProfile }) {
  const roleLabel =
    profile.role === "admin"
      ? "Administrador"
      : profile.role === "mechanic"
        ? "Mecánico"
        : "Usuario";

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 pl-16 md:px-8 md:pl-8">
      <div className="flex-1 flex min-w-0 items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">
            Hola, {profile.full_name || profile.email}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{roleLabel}</p>
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
    <div className="min-h-dvh bg-background">
      <DashboardSidebar role={profile.role} />

      <div className="md:pl-64 flex flex-col flex-1">
        <DashboardHeader profile={profile} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
