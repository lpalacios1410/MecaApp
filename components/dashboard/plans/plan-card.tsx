import Link from "next/link";
import { Bike, Car, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServicePlan } from "@/lib/plans-data";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: ServicePlan;
  showVehicleBadge: boolean;
  showAction?: boolean;
}

export function PlanCard({
  plan,
  showVehicleBadge,
  showAction = true,
}: PlanCardProps) {
  const isCar = plan.vehicleType === "car";

  return (
    <Card
      className={cn(
        "flex flex-col",
        plan.highlighted && "ring-1 ring-primary/60"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{plan.name}</CardTitle>
            <CardDescription>{plan.tagline}</CardDescription>
          </div>
          {showVehicleBadge && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                isCar ? "neon-badge-car" : "neon-badge-moto"
              )}
            >
              {isCar ? (
                <Car className="h-3.5 w-3.5" />
              ) : (
                <Bike className="h-3.5 w-3.5" />
              )}
              {plan.vehicleTypeLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          <span className="text-3xl font-bold">${plan.priceUsd}</span>
          <span className="text-sm text-muted-foreground"> USD / {plan.period}</span>
        </div>
        <ul className="flex-1 space-y-2 text-sm text-muted-foreground">
          {plan.services.map((service) => (
            <li key={service} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {service}
            </li>
          ))}
        </ul>
        {showAction && (
          <Link href="/dashboard/client/request" className="w-full">
            <Button className="w-full bg-default border">
              Solicitar servicio
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
