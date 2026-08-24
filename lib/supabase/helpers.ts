import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "user" | "mechanic";
  created_at: string;
  updated_at: string;
}

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

export async function getUserProfile(): Promise<UserProfile> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.claims.sub)
    .single();

  if (profileError || !profile) {
    redirect("/auth/login");
  }

  return profile as UserProfile;
}

export async function getUserVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", authData.claims.sub)
    .order("created_at", { ascending: false });

  if (vehiclesError) {
    return [];
  }

  return (vehicles as Vehicle[]) || [];
}

export async function getUserVehiclesCount(): Promise<number> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    return 0;
  }

  const { count } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authData.claims.sub);

  return count || 0;
}
