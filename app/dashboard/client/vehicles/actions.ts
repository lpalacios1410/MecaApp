"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface Vehicle {
  id: string;
  client_id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  notes: string | null;
  vehicle_type: "car" | "motorcycle" | null;
  created_at: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as Vehicle[]) || [];
}

export async function deleteVehicle(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) {
    return { error: "Error al eliminar el vehículo." };
  }

  redirect("/dashboard/client/vehicles");
}

export async function createVehicle(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  const plate = formData.get("plate") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = formData.get("year") as string;
  const color = formData.get("color") as string;
  const notes = formData.get("notes") as string;
  const vehicleType = formData.get("vehicleType") as string;

  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return { error: "Selecciona el tipo de vehículo." };
  }

  if (!plate || plate.trim().length < 3) {
    return { error: "La placa debe tener mínimo 3 caracteres." };
  }

  if (!brand || brand.trim().length < 2) {
    return { error: "La marca debe tener mínimo 2 caracteres." };
  }

  if (!model || model.trim().length < 1) {
    return { error: "El modelo es obligatorio." };
  }

  const yearNum = parseInt(year);
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    return { error: "Año inválido." };
  }

  const { error } = await supabase.from("vehicles").insert({
    client_id: user.id,
    plate: plate.trim().toUpperCase(),
    brand: brand.trim(),
    model: model.trim(),
    year: yearNum,
    color: color?.trim() || null,
    notes: notes?.trim() || null,
    vehicle_type: vehicleType,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un vehículo con esa placa." };
    }
    return { error: `Error al crear el vehículo: ${error.message}` };
  }

  redirect("/dashboard/client/vehicles");
}

export async function updateVehicleType(id: string, vehicleType: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return { error: "Tipo de vehículo inválido." };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({ vehicle_type: vehicleType })
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) {
    return { error: "Error al actualizar el tipo de vehículo." };
  }

  revalidatePath("/dashboard/client/plans");
  revalidatePath("/dashboard/client/vehicles");

  return { success: true };
}
