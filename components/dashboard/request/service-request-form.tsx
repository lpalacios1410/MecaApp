"use client"

import { useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { createOrder } from "@/app/dashboard/client/request/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, Eraser, Send } from "lucide-react"
import type { ServicePlan } from "@/lib/plans-data"
import { cn } from "@/lib/utils"

type FormVehicle = {
  id: string
  brand: string
  model: string
  plate: string
  vehicle_type: "car" | "motorcycle" | null
}

type FormMechanic = {
  id: string
  full_name: string | null
  email: string
}

interface ServiceRequestFormProps {
  vehicles: FormVehicle[]
  mechanics: FormMechanic[]
  plans: ServicePlan[]
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

export function ServiceRequestForm({
  vehicles,
  mechanics,
  plans,
}: ServiceRequestFormProps) {
  const classifiedVehicles = useMemo(
    () => vehicles.filter((v) => v.vehicle_type),
    [vehicles]
  )

  const [mechanicId, setMechanicId] = useState(
    mechanics.length === 1 ? mechanics[0].id : ""
  )
  const [vehicleId, setVehicleId] = useState(
    classifiedVehicles.length === 1 ? classifiedVehicles[0].id : ""
  )
  const [planId, setPlanId] = useState("")
  const [notes, setNotes] = useState("")

  const [state, formAction, isPending] = useActionState(
    async (prev: { error?: string }, formData: FormData) => {
      const result = await createOrder(formData)
      if (result?.error) {
        return { error: result.error }
      }
      return prev
    },
    {}
  )

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
  const selectedVehicleType = selectedVehicle?.vehicle_type ?? null

  const availablePlans = useMemo(
    () =>
      plans.filter(
        (p) => p.vehicleType === selectedVehicleType
      ),
    [plans, selectedVehicleType]
  )

  function handleClear() {
    setMechanicId("")
    setVehicleId("")
    setPlanId("")
    setNotes("")
  }

  const canSubmit = Boolean(mechanicId && vehicleId && planId) && !isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar servicio</CardTitle>
        <CardDescription>
          Elige tu mecánico, el vehículo y el plan de mantenimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mechanicId">Mecánico</Label>
            <select
              id="mechanicId"
              name="mechanicId"
              value={mechanicId}
              onChange={(event) => setMechanicId(event.target.value)}
              className={selectClassName}
            >
              <option value="">Selecciona un mecánico</option>
              {mechanics.map((mechanic) => (
                <option key={mechanic.id} value={mechanic.id}>
                  {mechanic.full_name?.trim() || mechanic.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehículo</Label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={vehicleId}
              onChange={(event) => {
                setVehicleId(event.target.value)
                setPlanId("")
              }}
              className={selectClassName}
            >
              <option value="">Selecciona un vehículo</option>
              {vehicles.map((vehicle) => {
                const typeLabel =
                  vehicle.vehicle_type === "motorcycle"
                    ? "Moto"
                    : vehicle.vehicle_type === "car"
                      ? "Carro"
                      : null
                return (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                    disabled={!vehicle.vehicle_type}
                  >
                    {typeLabel
                      ? `${typeLabel} — ${vehicle.brand} ${vehicle.model} (${vehicle.plate})`
                      : `${vehicle.brand} ${vehicle.model} (${vehicle.plate}) — sin clasificar`}
                  </option>
                )
              })}
            </select>
            {classifiedVehicles.length < vehicles.length && (
              <p className="text-xs text-muted-foreground">
                ¿Algún vehículo sin clasificar?{" "}
                <Link
                  href="/dashboard/client/plans"
                  className="text-primary underline"
                >
                  Clasifícalo aquí
                </Link>{" "}
                para poder solicitar su servicio.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Plan de mantenimiento</Label>
            {!selectedVehicle || !selectedVehicle.vehicle_type ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Primero selecciona un vehículo para ver los planes disponibles.
              </p>
            ) : (
              <div className="space-y-3">
                <input type="hidden" name="planId" value={planId} />
                {availablePlans.map((plan) => {
                  const isSelected = planId === plan.id
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setPlanId(isSelected ? "" : plan.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.tagline}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="whitespace-nowrap text-sm font-semibold">
                          ${plan.priceUsd} USD/mes
                        </span>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientNotes">Notas para el mecánico (opcional)</Label>
            <Textarea
              id="clientNotes"
              name="clientNotes"
              placeholder="Ej. Cuidado con los tornillos de la tapa lateral"
              maxLength={1000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="flex-1" disabled={!canSubmit}>
              <Send className="h-4 w-4" />
              {isPending ? "Enviando..." : "Enviar solicitud"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClear}
              disabled={isPending}
            >
              <Eraser className="h-4 w-4" />
              Limpiar formulario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
