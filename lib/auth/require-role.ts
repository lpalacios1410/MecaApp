import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/supabase/helpers"

type Role = "user" | "mechanic"

export async function requireRole(requiredRole: Role) {
  const profile = await getUserProfile().catch(() => null)

  if (!profile) {
    redirect("/login")
  }

  if (profile.role !== requiredRole) {
    const destination =
      profile.role === "mechanic"
        ? "/dashboard/mechanic"
        : "/dashboard/client"

    redirect(destination)
  }

  return profile
}
