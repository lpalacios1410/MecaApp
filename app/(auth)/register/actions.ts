"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const role = String(formData.get("role") ?? "user")

  if (fullName.length < 3) {
    redirect("/register?error=Escribe tu nombre completo")
  }

  if (!email.includes("@")) {
    redirect("/register?error=Escribe un correo valido")
  }

  if (password.length < 8) {
    redirect("/register?error=La clave debe tener al menos 8 caracteres")
  }

  if (role !== "user" && role !== "mechanic") {
    redirect("/register?error=Tipo de usuario invalido")
  }

  const supabase = await createClient()
  const headerList = await headers()

  const origin =
    headerList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      // emailRedirectTo: `${origin}/auth/confirm?next=/login`,
      emailRedirectTo: `${origin}/auth/confirm?next=/auth/email-success`,
    },
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/confirm-email?message=Revisa tu correo para confirmar tu cuenta")
}