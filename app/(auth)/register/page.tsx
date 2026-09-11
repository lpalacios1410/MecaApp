import Link from "next/link"
import { signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function describeError(error: string) {
  if (/confirmation email/i.test(error)) {
    return {
      title: "No pudimos enviar el correo de confirmación.",
      detail:
        "Esto suele ocurrir por el límite de envíos del correo integrado de Supabase (plan gratuito) o por SMTP sin configurar. Espera unos minutos e inténtalo de nuevo.",
    }
  }
  return { title: error, detail: null }
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorInfo = error ? describeError(error) : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crea tu cuenta en MecaAPP</CardTitle>
        </CardHeader>

        <CardContent>
          {errorInfo && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive space-y-1">
              <p className="font-medium">{errorInfo.title}</p>
              {errorInfo.detail && (
                <p className="text-destructive/80">{errorInfo.detail}</p>
              )}
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Ej. Ana Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ana@correo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Clave</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tipo de usuario</Label>
              <select
                id="role"
                name="role"
                defaultValue="user"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="user">Cliente</option>
                <option value="mechanic">Mecánico</option>
              </select>
            </div>

            <Button className="w-full" type="submit">
              Crear cuenta
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link className="underline" href="/login">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}