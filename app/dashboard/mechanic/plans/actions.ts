"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/require-role"
import { getPlanOrderCounts } from "@/lib/supabase/helpers"
import type { PlanVehicleType } from "@/lib/plans-data"

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string }

interface PlanFormValues {
  name: string
  vehicle_type: PlanVehicleType
  tagline: string
  price_usd: number
  period: string
  services: string[]
  highlighted: boolean
  is_active: boolean
  sort_order: number
}

type ParseResult =
  | { values: PlanFormValues }
  | { error: string }

function revalidatePlanPaths() {
  revalidatePath("/dashboard/mechanic/plans")
  revalidatePath("/dashboard/client/plans")
  revalidatePath("/dashboard/client/request")
}

function parsePlanForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim()
  const vehicleType = String(formData.get("vehicleType") ?? "")
  const tagline = String(formData.get("tagline") ?? "").trim()
  const priceRaw = String(formData.get("priceUsd") ?? "").trim()
  const period = String(formData.get("period") ?? "").trim() || "mes"
  const servicesRaw = String(formData.get("services") ?? "")
  const sortOrderRaw = String(formData.get("sortOrder") ?? "0").trim()
  const highlighted = formData.get("highlighted") === "on"
  const isActive = formData.get("isActive") === "on"

  if (name.length < 2) {
    return { error: "El nombre debe tener mínimo 2 caracteres." }
  }

  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return { error: "Selecciona el tipo de vehículo." }
  }

  if (!tagline) {
    return { error: "La descripción corta es obligatoria." }
  }

  if (priceRaw === "" || Number.isNaN(Number(priceRaw)) || Number(priceRaw) < 0) {
    return { error: "El precio debe ser un número mayor o igual a 0." }
  }

  const sortOrder = Number(sortOrderRaw)
  if (sortOrderRaw === "" || Number.isNaN(sortOrder)) {
    return { error: "El orden debe ser un número." }
  }

  const services = servicesRaw
    .split("\n")
    .map((service) => service.trim())
    .filter(Boolean)

  if (services.length === 0) {
    return { error: "Agrega al menos un servicio (uno por línea)." }
  }

  return {
    values: {
      name,
      vehicle_type: vehicleType,
      tagline,
      price_usd: Number(priceRaw),
      period,
      services,
      highlighted,
      is_active: isActive,
      sort_order: Math.trunc(sortOrder),
    },
  }
}

export async function createPlan(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("mechanic")

  const parsed = parsePlanForm(formData)
  if ("error" in parsed) {
    return { status: "error", error: parsed.error }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("plans").insert(parsed.values)

  if (error) {
    return { status: "error", error: `Error al crear el plan: ${error.message}` }
  }

  revalidatePlanPaths()
  return { status: "success", message: "Plan creado correctamente." }
}

export async function updatePlan(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("mechanic")

  const id = String(formData.get("id") ?? "")
  if (!id) {
    return { status: "error", error: "Plan inválido." }
  }

  const parsed = parsePlanForm(formData)
  if ("error" in parsed) {
    return { status: "error", error: parsed.error }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("plans")
    .update(parsed.values)
    .eq("id", id)

  if (error) {
    return { status: "error", error: `Error al actualizar el plan: ${error.message}` }
  }

  revalidatePlanPaths()
  return { status: "success", message: "Plan actualizado correctamente." }
}

export async function deletePlan(id: string): Promise<ActionResult> {
  await requireRole("mechanic")

  if (!id) {
    return { status: "error", error: "Plan inválido." }
  }

  const supabase = await createClient()

  const orderCounts = await getPlanOrderCounts()
  if ((orderCounts[id] ?? 0) > 0) {
    return {
      status: "error",
      error:
        "No se puede eliminar: el plan tiene órdenes asociadas. Desactívalo en su lugar.",
    }
  }

  const { error } = await supabase.from("plans").delete().eq("id", id)

  if (error) {
    return { status: "error", error: `Error al eliminar el plan: ${error.message}` }
  }

  revalidatePlanPaths()
  return { status: "success", message: "Plan eliminado correctamente." }
}

export async function togglePlanActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireRole("mechanic")

  if (!id) {
    return { status: "error", error: "Plan inválido." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("plans")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    return { status: "error", error: `Error al actualizar el plan: ${error.message}` }
  }

  revalidatePlanPaths()
  return {
    status: "success",
    message: isActive ? "Plan activado." : "Plan desactivado.",
  }
}

export async function duplicatePlan(id: string): Promise<ActionResult> {
  await requireRole("mechanic")

  if (!id) {
    return { status: "error", error: "Plan inválido." }
  }

  const supabase = await createClient()
  const { data: plan, error: fetchError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (fetchError || !plan) {
    return { status: "error", error: "No se encontró el plan a duplicar." }
  }

  const { error } = await supabase.from("plans").insert({
    name: `${plan.name} (copia)`,
    vehicle_type: plan.vehicle_type,
    tagline: plan.tagline,
    price_usd: plan.price_usd,
    period: plan.period,
    services: plan.services,
    highlighted: false,
    is_active: false,
    sort_order: plan.sort_order + 1,
  })

  if (error) {
    return { status: "error", error: `Error al duplicar el plan: ${error.message}` }
  }

  revalidatePlanPaths()
  return {
    status: "success",
    message: "Plan duplicado. Queda inactivo hasta que lo revises.",
  }
}
