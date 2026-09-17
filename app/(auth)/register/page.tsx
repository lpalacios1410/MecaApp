import Link from "next/link";
import { AlertCircle, Lock, Mail, User } from "lucide-react";
import { signup } from "./actions";
import { AuthShell, authInputClass } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function describeError(error: string) {
  if (/confirmation email/i.test(error)) {
    return {
      title: "No pudimos enviar el correo de confirmación.",
      detail:
        "Esto suele ocurrir por el límite de envíos del correo integrado de Supabase (plan gratuito) o por SMTP sin configurar. Espera unos minutos e inténtalo de nuevo.",
    };
  }
  return { title: error, detail: null };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorInfo = error ? describeError(error) : null;

  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Únete a MecaApp como propietario o mecánico. Es gratis y toma segundos."
    >
      {errorInfo && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">{errorInfo.title}</p>
            {errorInfo.detail && (
              <p className="text-red-400/80">{errorInfo.detail}</p>
            )}
          </div>
        </div>
      )}

      <form action={signup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-zinc-400">
            Nombre completo
          </Label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Ej. Ana Pérez"
              required
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-400">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ana@correo.com"
              required
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-400">
            Clave
          </Label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <SubmitButton>Crear cuenta</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          className="font-medium text-orange-400 underline-offset-4 transition-colors hover:text-orange-300 hover:underline"
          href="/login"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
