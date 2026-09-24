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

  revalidateOrderViews()

  return {
    status: "success",
    message: `Orden marcada como ${STATUS_LABELS[nextStatus].toLowerCase()}.`,
  }
}

function revalidateOrderViews() {
  revalidatePath("/dashboard/mechanic/orders")
  revalidatePath("/dashboard/mechanic/orders/active")
  revalidatePath("/dashboard/mechanic")
  revalidatePath("/dashboard/client/orders")
  revalidatePath("/dashboard/client")
}

export async function addOrderStep(
  orderId: string,
  title: string
): Promise<ActionResult> {
  await requireRole("mechanic")

  const cleanTitle = title.trim().replace(/\s+/g, " ")

  if (!orderId) {
    return { status: "error", error: "Orden inválida." }
  }

  if (cleanTitle.length < 2) {
    return { status: "error", error: "Escribe un paso más descriptivo." }
  }

  if (cleanTitle.length > 160) {
    return { status: "error", error: "El paso no puede superar 160 caracteres." }
  }

  const supabase = await createClient()

  const { count, error: countError } = await supabase
    .from("order_steps")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId)

  if (countError) {
    console.error("[addOrderStep:count]", countError)
    return { status: "error", error: "No se pudo agregar el paso." }
  }

  const { error } = await supabase.from("order_steps").insert({
    order_id: orderId,
    title: cleanTitle,
    sort_order: (count ?? 0) + 1,
  })

  if (error) {
    console.error("[addOrderStep]", error)
    return { status: "error", error: error.message || "No se pudo agregar el paso." }
  }

  revalidateOrderViews()
  return { status: "success", message: "Paso agregado." }
}

export async function toggleOrderStep(
  stepId: string,
  done: boolean
): Promise<ActionResult> {
  await requireRole("mechanic")

  if (!stepId) {
    return { status: "error", error: "Paso inválido." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("order_steps")
    .update({ done })
    .eq("id", stepId)
    .select("id")

  if (error) {
    console.error("[toggleOrderStep]", error)
    return { status: "error", error: error.message || "No se pudo actualizar el paso." }
  }

  if (!data || data.length === 0) {
    return { status: "error", error: "No se pudo actualizar el paso." }
  }

  revalidateOrderViews()
  return { status: "success", message: done ? "Paso completado." : "Paso reabierto." }
}

export async function removeOrderStep(stepId: string): Promise<ActionResult> {
  await requireRole("mechanic")

  if (!stepId) {
    return { status: "error", error: "Paso inválido." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("order_steps")
    .delete()
    .eq("id", stepId)
    .select("id")

  if (error) {
    console.error("[removeOrderStep]", error)
    return { status: "error", error: error.message || "No se pudo eliminar el paso." }
  }

  if (!data || data.length === 0) {
    return { status: "error", error: "No se pudo eliminar el paso." }
  }

  revalidateOrderViews()
  return { status: "success", message: "Paso eliminado." }
}
