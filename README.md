# MecaApp 🛠️🇻🇪

Plataforma Web Progresiva (**PWA Mobile-First**) diseñada para conectar a propietarios de vehículos (carros y motos) con mecánicos independientes y talleres especializados en Venezuela.

Lejos de un directorio estático tradicional, el sitio se siente como un **panel de control automotriz e industrial**: _dark mode_ profundo, tarjetas de selección táctiles, geolocalización en tiempo real, telemetría de talleres y flujos de trabajo optimizados para móviles.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)
![HeroUI](https://img.shields.io/badge/HeroUI-2.0-f97316?logo=react&logoColor=white)
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

- **Onboarding de Mecánicos interactivo** — formulario por pasos (Stepper) que permite configurar:
  - **Especialización de Vehículos:** Selección dinámica entre _Vehículos Ligeros_ (Sedanes, SUVs), _Carga Pesada_ y _Motocicletas_.
  - **Categorías de Servicio:** Selector tipo cápsula (_Chips_) para activar especialidades (Motor, Transmisión, Frenos, Electricidad, A/C, Escáner, Suspensión).
  - **Geolocalización:** Mapa interactivo centrado en la ubicación base (ej. Caracas) con selector de Zona / Municipio y Código Postal.
  - **Servicios Especiales:** Toggle reactivo para activar la disponibilidad de _Servicio a Domicilio / Grúa / Auxilio Vial_.
- **Gestión de Vehículos para Clientes** — registro de garaje personal para asociar vehículos (Marca, Modelo, Año, Placa) a las solicitudes de servicio.
- **Planes de Suscripción Integrados** — esquema de 3 niveles (Básico, Pro, Elite) con ventajas de posicionamiento en el directorio y métricas.
- **Seguridad nativa (RLS)** — protección de datos relacionales en PostgreSQL asegurando que cada mecánico o cliente solo modifique la información que le pertenece.

---

## 🛠️ Stack

| Herramienta          | Rol                                                                           |
| -------------------- | ----------------------------------------------------------------------------- |
| **Next.js 15**       | Framework React con App Router, SSR y Server Actions                          |
| **Tailwind CSS 3.4** | Estilos atómicos y tokens de diseño personalizados (`tailwind.config.ts`)     |
| **Shadcn (NextJS)**  | Librería de componentes accesibles para UI (_Cards, Chips, Switches, Modals_) |
| **Supabase**         | Backend-as-a-Service (PostgreSQL, Supabase Auth y Row Level Security)         |
| **TypeScript**       | Tipado estricto en toda la aplicación y esquemas de base de datos             |
| **Lucide React**     | Conjunto de íconos                                                            |
