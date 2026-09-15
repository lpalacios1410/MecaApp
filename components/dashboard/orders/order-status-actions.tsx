"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Ban, CheckCircle2, Play, PackageCheck } from "lucide-react"
import { updateOrderStatus } from "@/app/dashboard/mechanic/orders/actions"
import type { OrderStatus } from "@/lib/supabase/helpers"
import { Button } from "@/components/ui/button"

interface OrderStatusActionsProps {
  orderId: string
  status: OrderStatus
}

const ACTIONS: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string; icon: typeof Play }[]>
> = {
  pending: [
    { next: "accepted", label: "Aceptar", icon: CheckCircle2 },
    { next: "cancelled", label: "Cancelar", icon: Ban },
  ],
  accepted: [
    { next: "in_progress", label: "Iniciar", icon: Play },
    { next: "cancelled", label: "Cancelar", icon: Ban },
  ],
  in_progress: [
    { next: "completed", label: "Completar", icon: PackageCheck },
    { next: "cancelled", label: "Cancelar", icon: Ban },
  ],
}

export function OrderStatusActions({ orderId, status }: OrderStatusActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const actions = ACTIONS[status] ?? []
  if (actions.length === 0) {
    return null
  }

  function run(next: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next)
      if (result.status === "success") {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
      {actions.map((action) => {
        const Icon = action.icon
        const isCancel = action.next === "cancelled"
        return (
          <Button
            key={action.next}
            variant={isCancel ? "ghost" : "outline"}
            size="sm"
            className={isCancel ? "text-destructive hover:text-destructive" : ""}
            onClick={() => run(action.next)}
            disabled={isPending}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
