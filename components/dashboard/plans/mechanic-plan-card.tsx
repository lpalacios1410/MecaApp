"use client"

import {
  Bike,
  Car,
  Check,
  Copy,
  Eye,
  Pencil,
  Power,
  PowerOff,
  Star,
  Trash2,
} from "lucide-react"
import type { ServicePlan } from "@/lib/plans-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MechanicPlanCardProps {
  plan: ServicePlan
  orderCount: number
  isBusy: boolean
  onEdit: (plan: ServicePlan) => void
  onDelete: (plan: ServicePlan) => void
  onDuplicate: (plan: ServicePlan) => void
  onToggle: (plan: ServicePlan) => void
  onPreview: (plan: ServicePlan) => void
}

export function MechanicPlanCard({
  plan,
  orderCount,
  isBusy,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onPreview,
}: MechanicPlanCardProps) {
  const isCar = plan.vehicleType === "car"

  return (
    <Card
      className={cn(
        "flex flex-col",
        plan.highlighted && "ring-1 ring-primary/60",
        !plan.isActive && "opacity-60"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{plan.name}</CardTitle>
            <CardDescription>{plan.tagline}</CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {plan.highlighted && (
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3" />
                Destacado
              </Badge>
            )}
            {!plan.isActive && <Badge variant="secondary">Inactivo</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isCar ? <Car className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
          {plan.vehicleTypeLabel}
          <span className="text-border">•</span>
          Orden {plan.sortOrder}
        </div>

        <div>
          <span className="text-2xl font-bold">${plan.priceUsd}</span>
          <span className="text-sm text-muted-foreground">
            {" "}
            USD / {plan.period}
          </span>
        </div>

        <ul className="flex-1 space-y-1.5 text-sm text-muted-foreground">
          {plan.services.map((service, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {service}
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          {orderCount === 0
            ? "Sin órdenes asociadas"
            : `${orderCount} orden${orderCount !== 1 ? "es" : ""} asociada${
                orderCount !== 1 ? "s" : ""
              }`}
        </p>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(plan)}
            disabled={isBusy}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(plan)}
            disabled={isBusy}
          >
            <Eye className="h-4 w-4" />
            Vista previa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(plan)}
            disabled={isBusy}
          >
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(plan)}
            disabled={isBusy}
          >
            {plan.isActive ? (
              <>
                <PowerOff className="h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                Activar
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(plan)}
            disabled={isBusy}
          >
            <Trash2 className="h-4 w-4" />
            Borrar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
