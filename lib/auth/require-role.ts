import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type Role = "client" | "mechanic"

export async function requireRole(requiredRole: Role) {
  const supabase = await createClient()

  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .single()

  if (!profile) {
    redirect("/login?error=Perfil no encontrado")
  }

  if (profile.role !== requiredRole) {
    const destination =
      profile.role === "mechanic"
        ? "/dashboard/mecanico"
        : "/dashboard/cliente"

    redirect(destination)
  }

  return profile
}