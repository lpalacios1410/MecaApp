import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Revisa tu correo</CardTitle>
          <CardDescription>
            Te enviamos un enlace de confirmación. Haz clic en el enlace del
            correo para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿No lo recibiste? Revisa tu carpeta de spam o correo no deseado.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Volver al Inicio de Sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
