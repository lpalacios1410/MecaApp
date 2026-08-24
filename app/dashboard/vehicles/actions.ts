"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_type: "car" | "moto";
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    return [];
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", authData.claims.sub)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as Vehicle[]) || [];
}

export async function createVehicle(formData: FormData) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    return { error: "No autenticado." };
  }

  const vehicleType = formData.get("vehicle_type") as string;
  const plate = formData.get("plate") as string;
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = formData.get("year") as string;
  const color = formData.get("color") as string;

  if (!vehicleType || !["car", "moto"].includes(vehicleType)) {
    return { error: "Tipo de vehículo inválido." };
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
    user_id: authData.claims.sub,
    vehicle_type: vehicleType,
    plate: plate.trim().toUpperCase(),
    brand: brand.trim(),
    model: model.trim(),
    year: yearNum,
    color: color?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un vehículo con esa placa." };
    }
    return { error: "Error al crear el vehículo." };
  }

  redirect("/dashboard/plans");
}

export async function deleteVehicle(id: string) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    return { error: "No autenticado." };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id)
    .eq("user_id", authData.claims.sub);

  if (error) {
    return { error: "Error al eliminar el vehículo." };
  }

  redirect("/dashboard/vehicles");
}
