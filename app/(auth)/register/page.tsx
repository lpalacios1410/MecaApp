import Link from "next/link"
import { signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crea tu cuenta en MecaAPP</CardTitle>
        </CardHeader>

        <CardContent>
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
                defaultValue="client"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="client">Cliente</option>
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