import { redirect } from "next/navigation"
import { getCurrentUser, getUserProfile } from "@/lib/supabase/helpers"
import type { Role } from "@/lib/auth/roles"

export async function requireRole(requiredRole: Role) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile()

  if (profile.role !== requiredRole) {
    redirect(dashboardPathForRole(profile.role))
  }

  return profile
}

export function dashboardPathForRole(role: Role): string {
  if (role === "admin") return "/dashboard/admin"
  if (role === "mechanic") return "/dashboard/mechanic"
  return "/dashboard/client"
}
