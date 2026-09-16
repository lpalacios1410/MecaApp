import Link from "next/link"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicia Sesión</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form action={login} className="space-y-4">
            

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
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
            </div>

            

            <Button className="w-full" type="submit">
              Iniciar Sesión
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{" "}
            <Link className="underline" href="/register">
              Regístrate aquí.
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}