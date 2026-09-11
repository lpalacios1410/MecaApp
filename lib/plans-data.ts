export type PlanVehicleType = "car" | "motorcycle";

export interface ServicePlan {
  id: string;
  name: string;
  vehicleType: PlanVehicleType;
  vehicleTypeLabel: string;
  tagline: string;
  priceUsd: number;
  period: string;
  services: string[];
  highlighted: boolean;
  isActive: boolean;
  sortOrder: number;
}

export function planVehicleTypeLabel(vehicleType: PlanVehicleType): string {
  return vehicleType === "car" ? "Carro" : "Moto";
}
