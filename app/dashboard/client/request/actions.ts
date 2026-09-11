"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/helpers"
import { requireRole } from "@/lib/auth/require-role"
import { SERVICE_PLANS } from "@/lib/plans-data"

export async function createOrder(formData: FormData) {
  await requireRole("user")

  const vehicleId = String(formData.get("vehicleId") ?? "")
  const mechanicId = String(formData.get("mechanicId") ?? "")
  const planId = String(formData.get("planId") ?? "")
  const clientNotes = String(formData.get("clientNotes") ?? "").trim()

  if (!vehicleId || !mechanicId || !planId) {
    return { error: "Selecciona un mecánico, un vehículo y un plan." }
  }

  const plan = SERVICE_PLANS.find((p) => p.id === planId)
  if (!plan) {
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
    return { error: `Error al crear la orden: ${error.message}` }
  }

  redirect("/dashboard/client/orders?success=Solicitud enviada correctamente")
}
