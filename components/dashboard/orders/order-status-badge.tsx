import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/supabase/helpers";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "border-primary/50 bg-primary/10 text-primary",
  },
  accepted: {
    label: "Aceptada",
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  },
  in_progress: {
    label: "En progreso",
    className: "border-sky-500/50 bg-sky-500/10 text-sky-400",
  },
  completed: {
    label: "Completada",
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  },
  cancelled: {
    label: "Cancelada",
    className: "border-destructive/50 bg-destructive/10 text-destructive",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? statusConfig.pending;

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
