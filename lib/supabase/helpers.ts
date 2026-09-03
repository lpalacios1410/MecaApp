import { createClient } from "@/lib/supabase/server";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "mechanic";
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

export interface ClientWithVehicles {
  client: UserProfile;
  vehicles: Vehicle[];
}

async function getUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    throw new Error("No autenticado");
  }

  return { supabase, userId };
}

export async function getUserProfile(): Promise<UserProfile> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Perfil no encontrado");
  }

  return data as UserProfile;
}

export async function getUserVehicles(): Promise<Vehicle[]> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as Vehicle[]) || [];
}

export async function getUserVehiclesCount(): Promise<number> {
  const { supabase, userId } = await getUserId();

  const { count, error } = await supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count === null) {
    return 0;
  }

  return count;
}

export async function getClientsWithVehicles(): Promise<{
  clients: ClientWithVehicles[];
  total: number;
}> {
  const { supabase } = await getUserId();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("role", "user");

  if (profilesError || !profiles) {
    return { clients: [], total: 0 };
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("*");

  if (vehiclesError || !vehicles) {
    return { clients: [], total: 0 };
  }

  const vehiclesByUser = new Map<string, Vehicle[]>();
  for (const v of vehicles as Vehicle[]) {
    const list = vehiclesByUser.get(v.user_id) || [];
    list.push(v);
    vehiclesByUser.set(v.user_id, list);
  }

  const clients: ClientWithVehicles[] = (profiles as UserProfile[]).map(
    (profile) => ({
      client: profile,
      vehicles: vehiclesByUser.get(profile.id) || [],
    })
  );

  return { clients, total: clients.length };
}
