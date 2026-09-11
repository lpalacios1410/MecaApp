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

export async function getMechanics(): Promise<Mechanic[]> {
  const { supabase } = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "mechanic")
    .order("full_name", { ascending: true });

  if (error) {
    return [];
  }

  return (data as Mechanic[]) || [];
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
