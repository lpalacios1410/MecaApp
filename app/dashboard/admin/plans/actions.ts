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

const MAX_SERVICES = 30
const MAX_TEXT_LENGTH = 200

function revalidatePlanPaths() {
  revalidatePath("/dashboard/admin/plans")
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

  if (name.length < 2 || name.length > MAX_TEXT_LENGTH) {
    return { error: "El nombre debe tener entre 2 y 200 caracteres." }
  }

  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return { error: "Selecciona el tipo de vehículo." }
  }

  if (!tagline || tagline.length > MAX_TEXT_LENGTH) {
    return { error: "La descripción corta es obligatoria (máx. 200 caracteres)." }
  }

  if (period.length > 40) {
    return { error: "El periodo no puede superar 40 caracteres." }
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

  if (services.length > MAX_SERVICES) {
    return { error: `No se permiten más de ${MAX_SERVICES} servicios.` }
  }

  if (services.some((service) => service.length > MAX_TEXT_LENGTH)) {
    return { error: `Cada servicio debe tener máximo ${MAX_TEXT_LENGTH} caracteres.` }
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
  await requireRole("admin")

  const parsed = parsePlanForm(formData)
  if ("error" in parsed) {
    return { status: "error", error: parsed.error }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("plans").insert(parsed.values)

  if (error) {
    console.error("[createPlan]", error)
    return { status: "error", error: "No se pudo crear el plan. Inténtalo de nuevo." }
  }

  revalidatePlanPaths()
  return { status: "success", message: "Plan creado correctamente." }
}

export async function updatePlan(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireRole("admin")

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
    console.error("[updatePlan]", error)
    return { status: "error", error: "No se pudo actualizar el plan. Inténtalo de nuevo." }
  }

  revalidatePlanPaths()
  return { status: "success", message: "Plan actualizado correctamente." }
}

export async function deletePlan(id: string): Promise<ActionResult> {
  await requireRole("admin")

  if (!id) {
    return { status: "error", error: "Plan inválido." }
  }

  const { counts, error: countsError } = await getPlanOrderCounts()
  if (countsError) {
    return {
      status: "error",
      error: "No se pudo verificar las órdenes asociadas. Inténtalo de nuevo.",
    }
  }

  if ((counts[id] ?? 0) > 0) {
    return {
      status: "error",
      error:
        "No se puede eliminar: el plan tiene órdenes asociadas. Desactívalo en su lugar.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("plans").delete().eq("id", id)

  if (error) {
    console.error("[deletePlan]", error)
    return { status: "error", error: "No se pudo eliminar el plan. Inténtalo de nuevo." }
  }

  revalidatePlanPaths()
  return { status: "success", message: "Plan eliminado correctamente." }
}

export async function togglePlanActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireRole("admin")

  if (!id) {
    return { status: "error", error: "Plan inválido." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("plans")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    console.error("[togglePlanActive]", error)
    return { status: "error", error: "No se pudo actualizar el plan. Inténtalo de nuevo." }
  }

  revalidatePlanPaths()
  return {
    status: "success",
    message: isActive ? "Plan activado." : "Plan desactivado.",
  }
}

export async function duplicatePlan(id: string): Promise<ActionResult> {
  await requireRole("admin")

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
    console.error("[duplicatePlan]", error)
    return { status: "error", error: "No se pudo duplicar el plan. Inténtalo de nuevo." }
  }

  revalidatePlanPaths()
  return {
    status: "success",
    message: "Plan duplicado. Queda inactivo hasta que lo revises.",
  }
}
