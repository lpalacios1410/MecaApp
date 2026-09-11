import { cache } from "react";
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

export interface Mechanic {
  id: string;
  full_name: string | null;
  email: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface OrderRow {
  id: string;
  client_id: string;
  vehicle_id: string;
  mechanic_id: string;
  plan_id: string;
  plan_name: string;
  plan_price_usd: number;
  vehicle_type: "car" | "motorcycle";
  client_notes: string | null;
  status: OrderStatus;
  created_at: string;
}

interface OrderVehicleBrief {
  id: string;
  brand: string;
  model: string;
  plate: string;
}

interface OrderProfileBrief {
  id: string;
  full_name: string | null;
  email: string;
}

export interface OrderWithDetails extends OrderRow {
  vehicle: OrderVehicleBrief | null;
  client: OrderProfileBrief | null;
  mechanic: OrderProfileBrief | null;
}

async function getUserId() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error("No autenticado");
  }

  return { supabase, userId };
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
});

export const getUserProfile = cache(async (): Promise<UserProfile> => {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    const authUser = await getCurrentUser();
    if (authUser) {
      await supabase.from("profiles").insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || "",
        role: authUser.user_metadata?.role || "user",
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
});

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

export async function getClientsCount(): Promise<number> {
  const { supabase } = await getUserId();

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "user");

  if (error || count === null) {
    return 0;
  }

  return count;
}

const MECHANICS_TTL_MS = 60_000;
let mechanicsCache: { data: Mechanic[]; expiresAt: number } | null = null;

export async function getMechanics(): Promise<Mechanic[]> {
  if (mechanicsCache && mechanicsCache.expiresAt > Date.now()) {
    return mechanicsCache.data;
  }

  const { supabase } = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "mechanic")
    .order("full_name", { ascending: true });

  if (error) {
    return [];
  }

  const mechanics = (data as Mechanic[]) || [];
  mechanicsCache = { data: mechanics, expiresAt: Date.now() + MECHANICS_TTL_MS };
  return mechanics;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function attachOrderDetails(
  supabase: SupabaseServerClient,
  orders: OrderRow[]
): Promise<OrderWithDetails[]> {
  if (orders.length === 0) {
    return [];
  }

  const vehicleIds = [...new Set(orders.map((o) => o.vehicle_id))];
  const profileIds = [
    ...new Set(orders.flatMap((o) => [o.client_id, o.mechanic_id])),
  ];

  const [vehiclesRes, profilesRes] = await Promise.all([
    supabase.from("vehicles").select("id, brand, model, plate").in("id", vehicleIds),
    supabase.from("profiles").select("id, full_name, email").in("id", profileIds),
  ]);

  const vehiclesById = new Map<string, OrderVehicleBrief>();
  for (const vehicle of (vehiclesRes.data as OrderVehicleBrief[] | null) || []) {
    vehiclesById.set(vehicle.id, vehicle);
  }

  const profilesById = new Map<string, OrderProfileBrief>();
  for (const profile of (profilesRes.data as OrderProfileBrief[] | null) || []) {
    profilesById.set(profile.id, profile);
  }

  return orders.map((order) => ({
    ...order,
    vehicle: vehiclesById.get(order.vehicle_id) ?? null,
    client: profilesById.get(order.client_id) ?? null,
    mechanic: profilesById.get(order.mechanic_id) ?? null,
  }));
}

export async function getClientOrders(): Promise<OrderWithDetails[]> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("client_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return attachOrderDetails(supabase, data as OrderRow[]);
}

export async function getMechanicOrders(): Promise<OrderWithDetails[]> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("mechanic_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return attachOrderDetails(supabase, data as OrderRow[]);
}
