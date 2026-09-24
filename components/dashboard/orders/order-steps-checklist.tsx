"use client";

import { useTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Circle, Plus, Trash2 } from "lucide-react";
import {
  addOrderStep,
  removeOrderStep,
  toggleOrderStep,
} from "@/app/dashboard/mechanic/orders/actions";
import type { OrderStepRow } from "@/lib/supabase/helpers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderStepsChecklistProps {
  orderId: string;
  steps: OrderStepRow[];
}

export function OrderStepsChecklist({
  orderId,
  steps,
}: OrderStepsChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState("");

  const doneCount = steps.filter((step) => step.done).length;
  const percent =
    steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

  function handleToggle(stepId: string, done: boolean) {
    startTransition(async () => {
      const result = await toggleOrderStep(stepId, done);
      if (result.status === "success") {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRemove(stepId: string) {
    startTransition(async () => {
      const result = await removeOrderStep(stepId);
      if (result.status === "success") {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await addOrderStep(orderId, title);
      if (result.status === "success") {
        setNewTitle("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Puntos del trabajo</span>
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
          <li key={step.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleToggle(step.id, !step.done)}
              disabled={isPending}
              aria-pressed={step.done}
              className={cn(
                "flex min-h-11 flex-1 items-center gap-3 rounded-md px-2 text-left text-sm transition-colors",
                step.done
                  ? "text-muted-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {step.done ? (
                <Check className="h-5 w-5 shrink-0 text-primary" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />
              )}
              <span className={cn("min-w-0 break-words", step.done && "line-through")}>
                {step.title}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(step.id)}
              disabled={isPending}
              aria-label={`Eliminar paso: ${step.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2 pt-1">
        <Input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          placeholder="Agregar un paso..."
          maxLength={160}
          aria-label="Nuevo paso"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={isPending || newTitle.trim().length < 2}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Agregar</span>
        </Button>
      </form>
    </div>
  );
}
