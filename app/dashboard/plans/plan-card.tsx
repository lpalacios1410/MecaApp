"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export function PlanCard({
  plan,
  vehicleType,
}: {
  plan: Plan;
  vehicleType: string;
}) {
  const handleSelect = () => {
    alert(`Plan "${plan.name}" seleccionado para tu ${vehicleType === "car" ? "carro" : "moto"}. Próximamente se integrará el pago.`);
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        plan.popular && "border-primary shadow-lg"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
            Más Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/mes</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSelect}
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
        >
          Seleccionar Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
