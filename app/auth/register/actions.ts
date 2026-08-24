"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;

  if (!email || !email.includes("@")) {
    return { error: "Email inválido." };
  }

  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener mínimo 8 caracteres." };
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: "El nombre debe tener mínimo 2 caracteres." };
  }

  if (!role || !["user", "mechanic"].includes(role)) {
    return { error: "Tipo de usuario inválido." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      data: {
        full_name: fullName.trim(),
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/sign-up-success");
}
