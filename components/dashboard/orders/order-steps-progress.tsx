import { CheckCircle2, Circle } from "lucide-react";
import type { OrderStepRow } from "@/lib/supabase/helpers";
import { cn } from "@/lib/utils";

interface OrderStepsProgressProps {
  steps: OrderStepRow[];
  showTimes?: boolean;
  className?: string;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderStepsProgress({
  steps,
  showTimes = false,
  className,
}: OrderStepsProgressProps) {
  if (steps.length === 0) {
    return null;
  }

  const doneCount = steps.filter((step) => step.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Avance del servicio</span>
        <span className="text-muted-foreground">
          {doneCount}/{steps.length}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="space-y-1">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-center gap-2 text-sm leading-5"
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            )}
            <span
              className={cn(
                "min-w-0 break-words",
                step.done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.title}
            </span>
            {showTimes && step.done && step.completed_at && (
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatTime(step.completed_at)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
