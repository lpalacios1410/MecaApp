"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/require-role"

export async function createOrder(formData: FormData) {
  await requireRole("user")

  const vehicleId = String(formData.get("vehicleId") ?? "")
  const planId = String(formData.get("planId") ?? "")
  const preferredDate = String(formData.get("preferredDate") ?? "")
  const clientNotes = String(formData.get("clientNotes") ?? "")

  if (!vehicleId || !planId) {
    redirect("/dashboard/client/request?error=Selecciona un vehículo y un plan")
  }

  const supabase = await createClient()

  const { error } = await supabase.rpc("create_order", {
    p_vehicle_id: vehicleId,
    p_plan_id: planId,
    p_preferred_date: preferredDate || null,
    p_client_notes: clientNotes || null,
  })

  if (error) {
    redirect(
      `/dashboard/client/request?error=${encodeURIComponent(error.message)}`
    )
  }

  redirect("/dashboard/client/orders?success=Orden creada correctamente")
}