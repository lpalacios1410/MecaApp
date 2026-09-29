"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { resolveSiteOrigin } from "@/lib/auth/site-origin"

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  if (!email.includes("@")) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("Escribe un correo válido")}`
    )
  }

  const supabase = await createClient()
  const origin = await resolveSiteOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect("/reset-sent")
}
