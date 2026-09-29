"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (password.length < 8) {
    redirect(
      `/reset-password?error=${encodeURIComponent(
        "La clave debe tener al menos 8 caracteres"
      )}`
    )
  }

  if (password !== confirmPassword) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Las claves no coinciden")}`
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "El enlace de recuperación no es válido o expiró. Solicita uno nuevo."
      )}`
    )
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  await supabase.auth.signOut()
  redirect(
    `/login?message=${encodeURIComponent(
      "Tu contraseña fue actualizada. Inicia sesión con tu nueva clave."
    )}`
  )
}
