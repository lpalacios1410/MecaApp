"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/helpers"
import { requireRole } from "@/lib/auth/require-role"

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string }

export async function deleteOrder(id: string): Promise<ActionResult> {
  await requireRole("user")

  if (!id) {
    return { status: "error", error: "Orden inválida." }
  }

  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { status: "error", error: "No autenticado." }
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle()

  if (fetchError || !order) {
    return {
      status: "error",
      error: "No se encontró la orden (no existe o no tienes permiso).",
    }
  }

  if (order.status !== "pending") {
    return {
      status: "error",
      error: "Solo puedes eliminar solicitudes pendientes.",
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id)
    .eq("status", "pending")
    .select("id")

  if (error) {
    console.error("[deleteOrder]", error)
    return { status: "error", error: "Error al eliminar la orden." }
  }

  if (!data || data.length === 0) {
    return {
      status: "error",
      error: "No se pudo eliminar la orden (no existe o no tienes permiso).",
    }
  }

  revalidatePath("/dashboard/client/orders")
  revalidatePath("/dashboard/client")

  return { status: "success", message: "Orden eliminada correctamente." }
}
