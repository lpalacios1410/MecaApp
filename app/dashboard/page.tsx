import { getUserProfile } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();
  const profile = await getUserProfile();

  if (profile.role === "mechanic") {
    redirect("/dashboard/mechanic");
  }

  redirect("/dashboard/client");
}
