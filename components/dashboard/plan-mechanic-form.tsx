"use client"

import { useMemo, useState } from "react"
import { createOrder } from "@/app/dashboard/client/request/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Vehicle = {
  id: string
  brand: string
  model: string
  plate: string
}

type Mechanic = {
  id: string
  full_name: string
}

type Plan = {
  id: string
  mechanic_id: string
  name: string
  description: string | null
  price: number | string
  currency: string
}

type Props = {
  vehicles: Vehicle[]
  mechanics: Mechanic[]
  plans: Plan[]
}

export function PlanMechanicForm({
  vehicles,
  mechanics,
  plans,
}: Props) {
  const [mechanicId, setMechanicId] = useState("")
  const [planId, setPlanId] = useState("")

  const mechanicPlans = useMemo(() => {
    return plans.filter((plan) => plan.mechanic_id === mechanicId)
  }, [plans, mechanicId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar servicio</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={createOrder} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Tu vehículo</Label>
            <select
              id="vehicleId"
              name="vehicleId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecciona un vehículo</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} — {vehicle.plate}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mechanicId">Mecánico</Label>
            <select
              id="mechanicId"
              value={mechanicId}
              onChange={(event) => {
                setMechanicId(event.target.value)
                setPlanId("")
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecciona un mecánico</option>

              {mechanics.map((mechanic) => (
                <option key={mechanic.id} value={mechanic.id}>
                  {mechanic.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planId">Plan disponible</Label>
            <select
              id="planId"
              name="planId"
              required
              disabled={!mechanicId}
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {mechanicId
                  ? "Selecciona un plan"
                  : "Primero selecciona un mecánico"}
              </option>

              {mechanicPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {plan.currency} {plan.price}
                </option>
              ))}
            </select>
          </div>

          {planId && (
            <div className="rounded-lg border p-4 text-sm">
              {mechanicPlans
                .filter((plan) => plan.id === planId)
                .map((plan) => (
                  <div key={plan.id}>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-muted-foreground">
                      {plan.description || "Sin descripción"}
                    </p>
                    <p className="mt-2">
                      Precio: {plan.currency} {plan.price}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="preferredDate">Fecha preferida</Label>
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientNotes">Notas para el mecánico</Label>
            <Textarea
              id="clientNotes"
              name="clientNotes"
              placeholder="Ej. El carro hace un ruido al frenar."
              maxLength={1000}
            />
          </div>

          <Button className="w-full" type="submit">
            Crear solicitud
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}