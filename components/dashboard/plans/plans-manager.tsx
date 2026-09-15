"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Inbox, Plus, Search } from "lucide-react"
import type { ServicePlan } from "@/lib/plans-data"
import {
  deletePlan,
  duplicatePlan,
  togglePlanActive,
} from "@/app/dashboard/admin/plans/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MechanicPlanCard } from "@/components/dashboard/plans/mechanic-plan-card"
import { MechanicPlanForm } from "@/components/dashboard/plans/mechanic-plan-form"
import { PlanCard } from "@/components/dashboard/plans/plan-card"

type ActionResult =
  | { status: "success"; message: string }
  | { status: "error"; error: string }

type VehicleFilter = "all" | "car" | "motorcycle"

interface PlansManagerProps {
  plans: ServicePlan[]
  orderCounts: Record<string, number>
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-48"

export function PlansManager({ plans, orderCounts }: PlansManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<ServicePlan | null>(null)
  const [previewPlan, setPreviewPlan] = useState<ServicePlan | null>(null)

  const filteredPlans = useMemo(() => {
    const term = search.trim().toLowerCase()
    return plans.filter((plan) => {
      const matchesType =
        vehicleFilter === "all" || plan.vehicleType === vehicleFilter
      const matchesTerm =
        !term ||
        plan.name.toLowerCase().includes(term) ||
        plan.tagline.toLowerCase().includes(term)
      return matchesType && matchesTerm
    })
  }, [plans, search, vehicleFilter])

  const runAction = useCallback(
    (action: () => Promise<ActionResult>, onSuccess?: () => void) => {
      startTransition(async () => {
        const result = await action()
        if (result.status === "success") {
          toast.success(result.message)
          onSuccess?.()
          router.refresh()
        } else {
          toast.error(result.error)
        }
      })
    },
    [router]
  )

  const handleToggle = useCallback(
    (plan: ServicePlan) => {
      runAction(() => togglePlanActive(plan.id, !plan.isActive))
    },
    [runAction]
  )

  const handleDuplicate = useCallback(
    (plan: ServicePlan) => {
      runAction(() => duplicatePlan(plan.id))
    },
    [runAction]
  )

  const handleDelete = useCallback(() => {
    if (!deletingPlan) return
    const plan = deletingPlan
    runAction(
      () => deletePlan(plan.id),
      () => setDeletingPlan(null)
    )
  }, [deletingPlan, runAction])

  const closeCreate = useCallback(() => setCreateOpen(false), [])
  const closeEdit = useCallback(() => setEditingPlan(null), [])

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o descripción"
            className="pl-9"
          />
        </div>
        <select
          value={vehicleFilter}
          onChange={(event) =>
            setVehicleFilter(event.target.value as VehicleFilter)
          }
          className={selectClassName}
          aria-label="Filtrar por tipo de vehículo"
        >
          <option value="all">Todos los vehículos</option>
          <option value="car">Carros</option>
          <option value="motorcycle">Motos</option>
        </select>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo plan
        </Button>
      </div>

      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Inbox className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {plans.length === 0
                ? "Aún no hay planes. Crea el primero."
                : "No se encontraron planes con ese filtro."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlans.map((plan) => (
            <MechanicPlanCard
              key={plan.id}
              plan={plan}
              orderCount={orderCounts[plan.id] ?? 0}
              isBusy={isPending}
              onEdit={setEditingPlan}
              onDelete={setDeletingPlan}
              onDuplicate={handleDuplicate}
              onToggle={handleToggle}
              onPreview={setPreviewPlan}
            />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo plan</DialogTitle>
            <DialogDescription>
              Define los datos del plan de servicio.
            </DialogDescription>
          </DialogHeader>
          <MechanicPlanForm onSuccess={closeCreate} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingPlan !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPlan(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar plan</DialogTitle>
            <DialogDescription>{editingPlan?.name}</DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <MechanicPlanForm
              key={editingPlan.id}
              plan={editingPlan}
              onSuccess={closeEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingPlan !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingPlan(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar plan</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar &quot;{deletingPlan?.name}&quot;? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {deletingPlan && (orderCounts[deletingPlan.id] ?? 0) > 0 && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Este plan tiene {orderCounts[deletingPlan.id]} orden
              {orderCounts[deletingPlan.id] !== 1 ? "es" : ""} asociada
              {orderCounts[deletingPlan.id] !== 1 ? "s" : ""}. Desactívalo en
              lugar de borrarlo para conservar el historial.
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingPlan(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                isPending ||
                (deletingPlan
                  ? (orderCounts[deletingPlan.id] ?? 0) > 0
                  : false)
              }
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewPlan !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewPlan(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
            <DialogDescription>Así lo verá el cliente.</DialogDescription>
          </DialogHeader>
          {previewPlan && (
            <PlanCard plan={previewPlan} showVehicleBadge showAction={false} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
