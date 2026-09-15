import { getUserProfile } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { dashboardPathForRole } from "@/lib/auth/require-role";

export default async function DashboardPage() {
  await connection();
  const profile = await getUserProfile();

  redirect(dashboardPathForRole(profile.role));
}
