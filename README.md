# MecaApp 🛠️🇻🇪

Plataforma Web Progresiva (**PWA Mobile-First**) diseñada para conectar a propietarios de vehículos (carros y motos) con mecánicos independientes y talleres especializados en Venezuela.

Es un **panel de control automotriz** en modo oscuro: los clientes gestionan sus vehículos y solicitan planes de mantenimiento a mecánicos, y los administradores controlan el catálogo de planes y los roles de la plataforma.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)
![shadcn](https://img.shields.io/badge/shadcn%2FUI-Radix-f97316?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

---

## 📱 Previsualización de la Interfaz (UI)

|     Versión Desktop (Panel de Configuración)     |
| :----------------------------------------------: | 
|    ![MecaApp Desktop Setup](https://github.com/lpalacios1410/MecaApp/blob/1ea9a24af456880cfd089575a494f0e52096147f/public/mecaApp.jpg)
| _Vista ampliada para gestión de perfil y taller_ |

---

## ✨ Características

- **Gestión de Vehículos para Clientes** — registro del garaje personal (marca, modelo, año, placa) con clasificación carro/moto antes de solicitar un servicio.
- **Catálogo de Planes** — los administradores crean, editan, destacan, activan y duplican los planes que ven los clientes según el tipo de vehículo.
- **Solicitud de Servicio** — el cliente elige mecánico, vehículo y plan; el precio queda congelado (snapshot) en la orden.
- **Flujo de Órdenes del Mecánico** — transiciones validadas de estado: pendiente → aceptada → en progreso → completada (o cancelada en cualquier punto).
- **Roles y Permisos** — tres roles (cliente, mecánico, administrador) con panel propio; los administradores promueven mecánicos desde el gestor de usuarios.
- **Seguridad nativa (RLS)** — protección de datos en PostgreSQL: cada usuario solo accede a lo que le pertenece, y la escalada de privilegios está bloqueada por triggers.

---

## 🛠️ Stack

| Herramienta          | Rol                                                                           |
| -------------------- | ----------------------------------------------------------------------------- |
| **Next.js 16**       | Framework React con App Router, SSR y Server Actions (Turbopack)              |
| **Tailwind CSS 3.4** | Estilos atómicos y tokens de diseño personalizados (`tailwind.config.ts`)     |
| **Shadcn (NextJS)**  | Librería de componentes accesibles para UI (_Cards, Chips, Switches, Modals_) |
| **Supabase**         | Backend-as-a-Service (PostgreSQL, Supabase Auth y Row Level Security)         |
| **TypeScript**       | Tipado estricto en toda la aplicación y esquemas de base de datos             |
| **Lucide React**     | Conjunto de íconos                                                            |
