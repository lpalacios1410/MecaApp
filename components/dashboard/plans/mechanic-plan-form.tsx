"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import {
  createPlan,
  updatePlan,
} from "@/app/dashboard/mechanic/plans/actions"
import type { ServicePlan } from "@/lib/plans-data"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface MechanicPlanFormProps {
  plan?: ServicePlan
  onSuccess: () => void
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

export function MechanicPlanForm({ plan, onSuccess }: MechanicPlanFormProps) {
  const isEditing = Boolean(plan)
  const [state, formAction, isPending] = useActionState(
    isEditing ? updatePlan : createPlan,
    null
  )

  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message)
      onSuccess()
    } else if (state?.status === "error") {
      toast.error(state.error)
    }
  }, [state, onSuccess])

  return (
    <form action={formAction} className="space-y-4">
      {plan && <input type="hidden" name="id" value={plan.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="plan-name">Nombre del plan</Label>
          <Input
            id="plan-name"
            name="name"
            defaultValue={plan?.name}
            placeholder="Ej. Esencial Carro, Premium Moto 600"
            maxLength={80}
            required
          />
          <p className="text-xs text-muted-foreground">
            Un nombre claro para que el cliente reconozca el plan.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-vehicle-type">Tipo de vehículo</Label>
          <select
            id="plan-vehicle-type"
            name="vehicleType"
            defaultValue={plan?.vehicleType ?? "car"}
            className={selectClassName}
            required
          >
            <option value="car">Carro</option>
            <option value="motorcycle">Moto</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Ej. Carro (sedán, camioneta) o Moto (150cc, 600cc).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-sort-order">Orden</Label>
          <Input
            id="plan-sort-order"
            name="sortOrder"
            type="number"
            defaultValue={plan?.sortOrder ?? 0}
            placeholder="Ej. 1"
          />
          <p className="text-xs text-muted-foreground">
            Menor número aparece primero en la lista.
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="plan-tagline">Descripción corta</Label>
          <Input
            id="plan-tagline"
            name="tagline"
            defaultValue={plan?.tagline}
            placeholder="Ej. Lo básico para mantener tu carro al día"
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-price">Precio (USD)</Label>
          <Input
            id="plan-price"
            name="priceUsd"
            type="number"
            min="0"
            step="0.01"
            defaultValue={plan?.priceUsd ?? 0}
            placeholder="Ej. 19.99"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan-period">Periodo</Label>
          <Input
            id="plan-period"
            name="period"
            defaultValue={plan?.period ?? "mes"}
            placeholder="Ej. mes"
          />
          <p className="text-xs text-muted-foreground">
            Con qué frecuencia se cobra (mes, trimestre, año).
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="plan-services">Servicios (uno por línea)</Label>
          <Textarea
            id="plan-services"
            name="services"
            rows={5}
            defaultValue={plan?.services.join("\n")}
            placeholder={
              "Ej.\nCambio de aceite y filtro\nRevisión de niveles (frenos, refrigerante)\nInspección general de 15 puntos"
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            Escribe cada servicio en una línea distinta.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="plan-highlighted"
            name="highlighted"
            value="on"
            defaultChecked={plan?.highlighted ?? false}
          />
          <Label htmlFor="plan-highlighted">Destacado</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="plan-active"
            name="isActive"
            value="on"
            defaultChecked={plan ? plan.isActive : true}
          />
          <Label htmlFor="plan-active">Activo</Label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear plan"}
        </Button>
      </div>
    </form>
  )
}
