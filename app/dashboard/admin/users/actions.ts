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

  const admin = createAdminClient()
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
