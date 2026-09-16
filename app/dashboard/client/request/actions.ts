"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getPlanById } from "@/lib/supabase/helpers"
import { requireRole } from "@/lib/auth/require-role"

export async function createOrder(formData: FormData) {
  await requireRole("user")

  const vehicleId = String(formData.get("vehicleId") ?? "")
  const mechanicId = String(formData.get("mechanicId") ?? "")
  const planId = String(formData.get("planId") ?? "")
  const clientNotes = String(formData.get("clientNotes") ?? "").trim().slice(0, 1000)

  if (!vehicleId || !mechanicId || !planId) {
    return { error: "Selecciona un mecánico, un vehículo y un plan." }
  }

  const plan = await getPlanById(planId)
  if (!plan || !plan.isActive) {
    return { error: "El plan seleccionado no es válido." }
  }

  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "No autenticado." }
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, client_id, vehicle_type")
    .eq("id", vehicleId)
    .single()

  if (!vehicle || vehicle.client_id !== user.id) {
    return { error: "El vehículo seleccionado no es válido." }
  }

  if (!vehicle.vehicle_type) {
    return { error: "Clasifica tu vehículo antes de solicitar el servicio." }
  }

  if (vehicle.vehicle_type !== plan.vehicleType) {
    return { error: "El plan seleccionado no corresponde al tipo de tu vehículo." }
  }

  const { data: mechanic } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", mechanicId)
    .single()

  if (!mechanic || mechanic.role !== "mechanic") {
    return { error: "El mecánico seleccionado no es válido." }
  }

  const { error } = await supabase.from("orders").insert({
    client_id: user.id,
    vehicle_id: vehicleId,
    mechanic_id: mechanicId,
    plan_id: plan.id,
    plan_name: plan.name,
    plan_price_usd: plan.priceUsd,
    vehicle_type: plan.vehicleType,
    client_notes: clientNotes || null,
    status: "pending",
  })

  if (error) {
    console.error("[createOrder]", error)
    return { error: "No se pudo crear la solicitud. Inténtalo de nuevo." }
  }

  redirect(
    `/dashboard/client/orders?success=${encodeURIComponent("Solicitud enviada correctamente")}`
  )
}
