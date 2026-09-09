"use client";

import { useActionState } from "react";
import { createVehicle } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewVehiclePage() {
  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string }, formData: FormData) => {
      const result = await createVehicle(formData);
      if (result?.error) {
        return { error: result.error };
      }
      return prev;
    },
    {}
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/client/vehicles"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a Vehículos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevo Vehículo</CardTitle>
          <CardDescription>
            Ingresa los datos de tu vehículo para registrarlo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                name="plate"
                placeholder="Ej. ABC123"
                required
                minLength={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Ej. Toyota"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="Ej. Corolla"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="Ej. 2020"
                  required
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color (opcional)</Label>
                <Input id="color" name="color" placeholder="Ej. Rojo" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input id="notes" name="notes" placeholder="Ej. Gasolina, 4 puertas" />
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/client/vehicles" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Registrando..." : "Registrar Vehículo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
