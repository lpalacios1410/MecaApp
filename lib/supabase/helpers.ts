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
  redirect("/auth/error");
}

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.claims.sub)
    .single();

  if (profileError || !profile) {
    redirect("/auth/error?");
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

export interface ClientVehicle {
  vehicle_type: "car" | "moto";
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
}

export interface ClientWithVehicles {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  vehicles: ClientVehicle[];
}

export interface ClientsResult {
  clients: ClientWithVehicles[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getClientsWithVehicles(
  page: number = 1,
  pageSize: number = 5
): Promise<ClientsResult> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();

  if (!authData?.claims) {
    return { clients: [], total: 0, page: 1, pageSize, totalPages: 0 };
  }

  const { data: mechanicProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.claims.sub)
    .single();

  if (mechanicProfile?.role !== "mechanic") {
    return { clients: [], total: 0, page: 1, pageSize, totalPages: 0 };
  }

  const { count: total } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("id", authData.claims.sub)
    .eq("role", "user");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .neq("id", authData.claims.sub)
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!profiles || profiles.length === 0) {
    return {
      clients: [],
      total: total || 0,
      page,
      pageSize,
      totalPages: Math.ceil((total || 0) / pageSize),
    };
  }

  const profileIds = profiles.map((p) => p.id);

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("user_id, vehicle_type, plate, brand, model, year, color")
    .in("user_id", profileIds);

  const vehiclesByUser = new Map<string, ClientVehicle[]>();
  (vehicles || []).forEach((v) => {
    const existing = vehiclesByUser.get(v.user_id) || [];
    existing.push({
      vehicle_type: v.vehicle_type,
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      year: v.year,
      color: v.color,
    });
    vehiclesByUser.set(v.user_id, existing);
  });

  const clients: ClientWithVehicles[] = profiles.map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    created_at: profile.created_at,
    vehicles: vehiclesByUser.get(profile.id) || [],
  }));

  return {
    clients,
    total: total || 0,
    page,
    pageSize,
    totalPages: Math.ceil((total || 0) / pageSize),
  };
}
