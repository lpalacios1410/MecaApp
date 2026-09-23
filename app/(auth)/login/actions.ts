"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { dashboardPathForRole } from "@/lib/auth/require-role"
import { isOwnerEmail, type Role } from "@/lib/auth/roles"

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !user) {
    redirect(`/login?error=${encodeURIComponent("Correo o clave incorrectos")}`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  let role: Role =
    profile?.role === "mechanic"
      ? "mechanic"
      : profile?.role === "admin"
        ? "admin"
        : "user"

  if (isOwnerEmail(user.email) && role !== "admin") {
    try {
      const admin = createAdminClient()
      const { error: roleError } = await admin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.id)

      if (!roleError) {
        role = "admin"
      } else {
        console.error("[login] No se pudo restaurar el rol del owner:", roleError)
      }
    } catch (roleError) {
      console.error("[login] Error al restaurar el rol del owner:", roleError)
    }
  }

  redirect(dashboardPathForRole(role))
}
