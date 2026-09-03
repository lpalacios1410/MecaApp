"use server";

import { createClient } from "@/lib/supabase/server";

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
}
