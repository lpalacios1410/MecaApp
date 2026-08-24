"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createVehicle } from "@/app/dashboard/vehicles/actions";

export function VehicleForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createVehicle(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 max-w-lg", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrar Vehículo</CardTitle>
          <CardDescription>
            Ingresa los datos de tu vehículo para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicle_type">Tipo de Vehículo</Label>
                <select
                  id="vehicle_type"
                  name="vehicle_type"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="car">Carro</option>
                  <option value="moto">Moto</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  name="plate"
                  type="text"
                  placeholder="ABC-123"
                  required
                  minLength={3}
                  className="uppercase"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  name="brand"
                  type="text"
                  placeholder="Toyota, Honda, etc."
                  required
                  minLength={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  name="model"
                  type="text"
                  placeholder="Corolla, CBR, etc."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="2024"
                  required
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Color (opcional)</Label>
                <Input
                  id="color"
                  name="color"
                  type="text"
                  placeholder="Rojo, Azul, etc."
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar Vehículo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
