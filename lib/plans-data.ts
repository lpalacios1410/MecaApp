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
  highlighted?: boolean;
}

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: "car-esencial",
    name: "Esencial Carro",
    vehicleType: "car",
    vehicleTypeLabel: "Carro",
    tagline: "Lo básico para mantener tu carro al día",
    priceUsd: 19,
    period: "mes",
    services: [
      "Cambio de aceite y filtro de aceite",
      "Revisión de niveles (frenos, refrigerante, dirección)",
      "Inspección general de 15 puntos",
    ],
  },
  {
    id: "car-integral",
    name: "Integral Carro",
    vehicleType: "car",
    vehicleTypeLabel: "Carro",
    tagline: "Mantenimiento completo para uso diario",
    priceUsd: 39,
    period: "mes",
    services: [
      "Todo lo del plan Esencial",
      "Filtro de aire y filtro de combustible",
      "Revisión de frenos (pastillas y discos)",
      "Alineación y balanceo",
      "Diagnóstico computarizado",
    ],
  },
  {
    id: "car-premium",
    name: "Premium Carro",
    vehicleType: "car",
    vehicleTypeLabel: "Carro",
    tagline: "Cuidado total con atención prioritaria",
    priceUsd: 79,
    period: "mes",
    highlighted: true,
    services: [
      "Todo lo del plan Integral",
      "Revisión de suspensión y amortiguadores",
      "Sistema eléctrico y batería",
      "Aire acondicionado",
      "Atención prioritaria y soporte 24/7",
    ],
  },
  {
    id: "moto-150",
    name: "Moto 150",
    vehicleType: "motorcycle",
    vehicleTypeLabel: "Moto",
    tagline: "Para motos 150cc de uso urbano",
    priceUsd: 12,
    period: "mes",
    services: [
      "Cambio de aceite",
      "Ajuste y lubricación de cadena",
      "Revisión de frenos y desgaste de llantas",
      "Revisión de luces y cables",
    ],
  },
  {
    id: "moto-200-250",
    name: "Moto 200–250",
    vehicleType: "motorcycle",
    vehicleTypeLabel: "Moto",
    tagline: "Para motos 200–250cc, listas para la ruta",
    priceUsd: 24,
    period: "mes",
    services: [
      "Todo lo del plan Moto 150",
      "Filtro de aire",
      "Ajuste de válvulas",
      "Revisión de carburación o inyección",
      "Engrase general",
    ],
  },
  {
    id: "moto-600",
    name: "Moto 600",
    vehicleType: "motorcycle",
    vehicleTypeLabel: "Moto",
    tagline: "Para motos 600cc de alta cilindrada",
    priceUsd: 49,
    period: "mes",
    highlighted: true,
    services: [
      "Todo lo del plan Moto 200–250",
      "Mantenimiento de inyección electrónica",
      "Líquido de frenos",
      "Revisión de suspensión y horquilla",
      "Diagnóstico completo",
    ],
  },
];
