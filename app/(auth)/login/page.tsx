import Link from "next/link";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { login } from "./actions";
import { AuthShell, authInputClass } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      description="Inicia sesión para gestionar tus servicios y mecánicos de confianza."
    >
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form action={login} className="space-y-4">
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
            Contraseña
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
              autoComplete="current-password"
              placeholder="••••••••"
              minLength={8}
              required
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <SubmitButton>Iniciar Sesión</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        ¿Aún no tienes cuenta?{" "}
        <Link
          className="font-medium text-orange-400 underline-offset-4 transition-colors hover:text-orange-300 hover:underline"
          href="/register"
        >
          Regístrate aquí
        </Link>
        .
      </p>
    </AuthShell>
  );
}
