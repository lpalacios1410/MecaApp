"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export async function register(formData: FormData) {
  const values = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = registerSchema.safeParse(values);

  if (!result.success) {
    return {
      error: "Revisa el email y la contraseña.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo:
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect("/login?registered=true");
}