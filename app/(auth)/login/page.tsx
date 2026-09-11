import Link from "next/link"
import { login } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicia Sesion</CardTitle>
        </CardHeader>

        <CardContent>
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
              Iniciar sesion
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Aun no tienes cuenta?{" "}
            <Link className="underline" href="/register">
              Registrate aqui!
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}