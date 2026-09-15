"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignedOutPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LogOut className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sesión cerrada</CardTitle>
          <CardDescription>
            Has cerrado sesión correctamente. Serás redirigido en unos segundos...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Si no eres redirigido, haz clic{" "}
            <Link href="/" className="text-primary underline">
              aquí
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
