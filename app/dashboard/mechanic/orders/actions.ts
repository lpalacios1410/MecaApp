"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, type OrderStatus } from "@/lib/supabase/helpers"
import { requireRole } from "@/lib/auth/require-role"

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string }

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<ActionResult> {
  await requireRole("mechanic")

  if (!orderId) {
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
    .eq("id", orderId)
    .eq("mechanic_id", user.id)
    .single()

  if (fetchError || !order) {
    return { status: "error", error: "No se encontró la orden." }
  }

  const allowed = TRANSITIONS[order.status as OrderStatus] ?? []
  if (!allowed.includes(nextStatus)) {
    return {
      status: "error",
      error: "No se puede cambiar la orden a ese estado.",
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("mechanic_id", user.id)
    .select("id")

  if (error) {
    console.error("[updateOrderStatus]", error)
    return { status: "error", error: "No se pudo actualizar la orden." }
  }

  if (!data || data.length === 0) {
    return { status: "error", error: "No se pudo actualizar la orden." }
  }

  revalidatePath("/dashboard/mechanic/orders")
  revalidatePath("/dashboard/mechanic")
  revalidatePath("/dashboard/client/orders")
  revalidatePath("/dashboard/client")

  return {
    status: "success",
    message: `Orden marcada como ${STATUS_LABELS[nextStatus].toLowerCase()}.`,
  }
}
