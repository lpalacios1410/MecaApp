import Link from "next/link";
import { AlertCircle, Lock } from "lucide-react";
import { updatePassword } from "./actions";
import { AuthShell, authInputClass } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Nueva contraseña"
      description="Escribe y confirma tu nueva clave para recuperar el acceso a tu cuenta."
    >
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form action={updatePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-400">
            Nueva contraseña
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-zinc-400">
            Confirmar contraseña
          </Label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu nueva contraseña"
              minLength={8}
              required
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <SubmitButton>Guardar nueva clave</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        ¿Prefieres cancelar?{" "}
        <Link
          className="font-medium text-orange-400 underline-offset-4 transition-colors hover:text-orange-300 hover:underline"
          href="/login"
        >
          Volver al inicio de sesión
        </Link>
        .
      </p>
    </AuthShell>
  );
}
