import { createClient } from "@/lib/supabase/server";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "mechanic";
}

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

export interface ClientWithVehicles {
  client: UserProfile;
  vehicles: Vehicle[];
}

async function getUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;

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
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user) {
      await supabase.from("profiles").insert({
        id: authUser.user.id,
        email: authUser.user.email!,
        full_name: authUser.user.user_metadata?.full_name || "",
        role: authUser.user.user_metadata?.role || "user",
      });

      const { data: newData } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .single();
      if (newData) return newData as UserProfile;
    }
    throw new Error("Perfil no encontrado");
  }

  return data as UserProfile;
}

export async function getUserVehicles(): Promise<Vehicle[]> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("client_id", userId)
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
    .eq("client_id", userId);

  if (error || count === null) {
    return 0;
  }

  return count;
}

export async function getClientsWithVehicles(): Promise<{
  users: ClientWithVehicles[];
  total: number;
}> {
  const { supabase } = await getUserId();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("role", "user");

  if (profilesError || !profiles) {
    return {users: [], total: 0 };
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("*");

  if (vehiclesError || !vehicles) {
    return {users: [], total: 0 };
  }

  const vehiclesByUser = new Map<string, Vehicle[]>();
  for (const v of vehicles as Vehicle[]) {
    const list = vehiclesByUser.get(v.client_id) || [];
    list.push(v);
    vehiclesByUser.set(v.client_id, list);
  }

  const users: ClientWithVehicles[] = (profiles as UserProfile[]).map(
    (profile) => ({
      client: profile,
      vehicles: vehiclesByUser.get(profile.id) || [],
    })
  );

  return {users, total:users.length };
}
