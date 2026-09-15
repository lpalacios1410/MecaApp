import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth/roles";
import {
  planVehicleTypeLabel,
  type PlanVehicleType,
  type ServicePlan,
} from "@/lib/plans-data";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
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

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 12;

const VEHICLE_COLUMNS =
  "id, client_id, plate, brand, model, year, color, notes, vehicle_type, created_at";
const ORDER_COLUMNS =
  "id, client_id, vehicle_id, mechanic_id, plan_id, plan_name, plan_price_usd, vehicle_type, client_notes, status, created_at";

function fail(scope: string, error: unknown): never {
  console.error(`[supabase:${scope}]`, error);
  throw new Error("No se pudieron cargar los datos. Inténtalo de nuevo.");
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
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || "",
          role: "user",
        })
        .select("id")
        .single();

      if (insertError) {
        fail("getUserProfile:insert", insertError);
      }

      const { data: newData, error: newError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", userId)
        .single();

      if (newError || !newData) {
        fail("getUserProfile:reselect", newError);
      }

      return newData as UserProfile;
    }

    throw new Error("Perfil no encontrado");
  }

  return data as UserProfile;
});

export async function getUserVehicles(): Promise<Vehicle[]> {
  const { supabase, userId } = await getUserId();

  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_COLUMNS)
    .eq("client_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    fail("getUserVehicles", error);
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
    fail("getUserVehiclesCount", error);
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
    fail("getClientsCount", error);
  }

  return count;
}

export const getMechanics = cache(async (): Promise<Mechanic[]> => {
  const { supabase } = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "mechanic")
    .order("full_name", { ascending: true });

  if (error) {
    fail("getMechanics", error);
  }

  return (data as Mechanic[]) || [];
});

interface PlanRow {
  id: string;
  name: string;
  vehicle_type: PlanVehicleType;
  tagline: string;
  price_usd: number;
  period: string;
  services: string[] | null;
  highlighted: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const PLAN_SELECT =
  "id, name, vehicle_type, tagline, price_usd, period, services, highlighted, is_active, sort_order, created_at";

function mapPlanRow(row: PlanRow): ServicePlan {
  return {
    id: row.id,
    name: row.name,
    vehicleType: row.vehicle_type,
    vehicleTypeLabel: planVehicleTypeLabel(row.vehicle_type),
    tagline: row.tagline,
    priceUsd: Number(row.price_usd),
    period: row.period,
    services: row.services ?? [],
    highlighted: row.highlighted,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export const getActivePlans = cache(async (): Promise<ServicePlan[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("price_usd", { ascending: true });

  if (error || !data) {
    fail("getActivePlans", error);
  }

  return (data as PlanRow[]).map(mapPlanRow);
});

export const getAllPlans = cache(async (): Promise<ServicePlan[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_SELECT)
    .order("sort_order", { ascending: true })
    .order("price_usd", { ascending: true });

  if (error || !data) {
    fail("getAllPlans", error);
  }

  return (data as PlanRow[]).map(mapPlanRow);
});

export async function getPlanById(id: string): Promise<ServicePlan | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    fail("getPlanById", error);
  }

  if (!data) {
    return null;
  }

  return mapPlanRow(data as PlanRow);
}

export interface PlanOrderCounts {
  counts: Record<string, number>;
  error: Error | null;
}

export async function getPlanOrderCounts(): Promise<PlanOrderCounts> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_plan_order_counts");

  if (error) {
    console.error("[supabase:getPlanOrderCounts]", error);
    return { counts: {}, error: new Error(error.message) };
  }

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { plan_id: string; order_count: number }[]) {
    counts[row.plan_id] = Number(row.order_count);
  }

  return { counts, error: null };
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

  if (vehiclesRes.error || profilesRes.error) {
    fail("attachOrderDetails", vehiclesRes.error ?? profilesRes.error);
  }

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

function normalizePage(page: number) {
  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;
}

async function getOrdersPage(
  scope: string,
  column: "client_id" | "mechanic_id",
  page: number,
  pageSize: number
): Promise<Page<OrderWithDetails>> {
  const { supabase, userId } = await getUserId();
  const safePage = normalizePage(page);
  const safeSize = pageSize > 0 ? Math.trunc(pageSize) : DEFAULT_PAGE_SIZE;
  const from = (safePage - 1) * safeSize;

  const { data, error, count } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS, { count: "exact" })
    .eq(column, userId)
    .order("created_at", { ascending: false })
    .range(from, from + safeSize - 1);

  if (error || !data) {
    fail(scope, error);
  }

  const total = count ?? 0;
  const items = await attachOrderDetails(supabase, data as OrderRow[]);

  return {
    items,
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}

export function getClientOrders(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<Page<OrderWithDetails>> {
  return getOrdersPage("getClientOrders", "client_id", page, pageSize);
}

export function getMechanicOrders(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<Page<OrderWithDetails>> {
  return getOrdersPage("getMechanicOrders", "mechanic_id", page, pageSize);
}

async function countOrders(
  scope: string,
  column: "client_id" | "mechanic_id",
  status?: OrderStatus
): Promise<number> {
  const { supabase, userId } = await getUserId();

  let query = supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq(column, userId);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error || count === null) {
    fail(scope, error);
  }

  return count;
}

export interface OrderStats {
  total: number;
  pending: number;
}

export async function getClientOrdersStats(): Promise<OrderStats> {
  const [total, pending] = await Promise.all([
    countOrders("getClientOrdersStats:total", "client_id"),
    countOrders("getClientOrdersStats:pending", "client_id", "pending"),
  ]);
  return { total, pending };
}

export async function getMechanicOrdersStats(): Promise<OrderStats> {
  const [total, pending] = await Promise.all([
    countOrders("getMechanicOrdersStats:total", "mechanic_id"),
    countOrders("getMechanicOrdersStats:pending", "mechanic_id", "pending"),
  ]);
  return { total, pending };
}

export interface UserAdminRow {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

const USER_ADMIN_COLUMNS = "id, email, full_name, role, created_at";

export async function getUsersPage(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  role?: Role
): Promise<Page<UserAdminRow>> {
  const { supabase } = await getUserId();
  const safePage = normalizePage(page);
  const safeSize = pageSize > 0 ? Math.trunc(pageSize) : DEFAULT_PAGE_SIZE;
  const from = (safePage - 1) * safeSize;

  let query = supabase
    .from("profiles")
    .select(USER_ADMIN_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + safeSize - 1);

  if (role) {
    query = query.eq("role", role);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    fail("getUsersPage", error);
  }

  const total = count ?? 0;

  return {
    items: (data as UserAdminRow[]) || [],
    total,
    page: safePage,
    pageSize: safeSize,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}
