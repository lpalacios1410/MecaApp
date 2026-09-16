"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth/require-role"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Role } from "@/lib/auth/roles"

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string }

const ASSIGNABLE_ROLES: Role[] = ["user", "mechanic"]

export async function setUserRole(id: string, role: Role): Promise<ActionResult> {
  const adminProfile = await requireRole("admin")

  if (!id) {
    return { status: "error", error: "Usuario inválido." }
  }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { status: "error", error: "Ese rol no se puede asignar desde aquí." }
  }

  if (id === adminProfile.id) {
    return { status: "error", error: "No puedes cambiar tu propio rol." }
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (adminError) {
    console.error("[setUserRole] createAdminClient:", adminError)
    return {
      status: "error",
      error:
        "El servidor no tiene SUPABASE_SERVICE_ROLE_KEY configurado. Agrégalo en los secrets de despliegue.",
    }
  }

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle()

  if (!target) {
    return { status: "error", error: "No se encontró al usuario." }
  }

  if (target.role === "admin") {
    return {
      status: "error",
      error: "No puedes cambiar el rol de otro administrador.",
    }
  }

  const { data, error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("[setUserRole]", error)
    return { status: "error", error: "No se pudo actualizar el rol. Inténtalo de nuevo." }
  }

  if (!data) {
    return { status: "error", error: "No se encontró al usuario." }
  }

  revalidatePath("/dashboard/admin/users")

  return {
    status: "success",
    message:
      role === "mechanic"
        ? "Usuario promovido a mecánico."
        : "El usuario volvió a ser cliente.",
  }
}
