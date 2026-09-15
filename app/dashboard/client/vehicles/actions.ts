"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/helpers";
import { requireRole } from "@/lib/auth/require-role";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteVehicle(id: string) {
  await requireRole("user");

  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", id)
    .eq("client_id", user.id);

  if (countError) {
    console.error("[deleteVehicle:count]", countError);
    return { error: "No se pudo verificar el vehículo. Inténtalo de nuevo." };
  }

  if ((count ?? 0) > 0) {
    return {
      error:
        "Este vehículo tiene órdenes asociadas. Elimínalas o espera a que finalicen antes de borrarlo.",
    };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) {
    console.error("[deleteVehicle]", error);
    if (error.code === "23503") {
      return {
        error:
          "No se puede eliminar el vehículo porque tiene órdenes asociadas.",
      };
    }
    return { error: "Error al eliminar el vehículo." };
  }

  redirect("/dashboard/client/vehicles");
}

export async function createVehicle(formData: FormData) {
  await requireRole("user");

  const supabase = await createClient();
  const user = await getCurrentUser();

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

  const yearNum = Number(year);
  if (
    !Number.isInteger(yearNum) ||
    yearNum < 1900 ||
    yearNum > new Date().getFullYear() + 1
  ) {
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
    console.error("[createVehicle]", error);
    if (error.code === "23505") {
      return { error: "Ya tienes un vehículo registrado con esa placa." };
    }
    return { error: "No se pudo crear el vehículo. Inténtalo de nuevo." };
  }

  redirect("/dashboard/client/vehicles");
}

export async function updateVehicleType(id: string, vehicleType: string) {
  await requireRole("user");

  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  if (vehicleType !== "car" && vehicleType !== "motorcycle") {
    return { error: "Tipo de vehículo inválido." };
  }

  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", id)
    .eq("client_id", user.id);

  if (countError) {
    console.error("[updateVehicleType:count]", countError);
    return { error: "No se pudo verificar el vehículo. Inténtalo de nuevo." };
  }

  if ((count ?? 0) > 0) {
    return {
      error:
        "No puedes cambiar el tipo de un vehículo que ya tiene órdenes asociadas.",
    };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({ vehicle_type: vehicleType })
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) {
    console.error("[updateVehicleType]", error);
    return { error: "Error al actualizar el tipo de vehículo." };
  }

  revalidatePath("/dashboard/client/plans");
  revalidatePath("/dashboard/client/vehicles");

  return { success: true };
}
