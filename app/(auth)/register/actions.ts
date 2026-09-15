"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { resolveRoleFromAllowlist } from "@/lib/auth/roles"

export async function signup(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (fullName.length < 3) {
    redirect("/register?error=Escribe tu nombre completo")
  }

  if (!email.includes("@")) {
    redirect("/register?error=Escribe un correo valido")
  }

  if (password.length < 8) {
    redirect("/register?error=La clave debe tener al menos 8 caracteres")
  }

  const supabase = await createClient()
  const headerList = await headers()

  const origin =
    headerList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=/auth/email-success`,
    },
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  const role = resolveRoleFromAllowlist(email)
  if (role !== "user" && data.user) {
    try {
      const admin = createAdminClient()
      const { error: roleError } = await admin
        .from("profiles")
        .update({ role })
        .eq("id", data.user.id)

      if (roleError) {
        console.error("[signup] No se pudo asignar el rol:", roleError)
      }
    } catch (roleError) {
      console.error("[signup] Error al asignar rol desde allowlist:", roleError)
    }
  }

  redirect("/confirm-email?message=Revisa tu correo para confirmar tu cuenta")
}
