"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { dashboardPathForRole } from "@/lib/auth/require-role"
import type { Role } from "@/lib/auth/roles"

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
    redirect("/login?error=Correo o clave incorrectos")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role: Role =
    profile?.role === "mechanic"
      ? "mechanic"
      : profile?.role === "admin"
        ? "admin"
        : "user"

  redirect(dashboardPathForRole(role))
}
