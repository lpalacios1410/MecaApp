import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Play,
  UserPlus,
  Wrench,
  Zap,
} from "lucide-react";
import { AuroraCanvas } from "@/components/aurora-canvas";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Regístrate",
    description: "Crea tu cuenta como propietario o mecánico en segundos.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "Encuentra un Mecánico",
    description:
      "Explora el directorio con geolocalización, filtra por especialidad y zona.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Agenda tu Servicio",
    description: "Solicita cita, domicilio o auxilio vial. Todo desde la app.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-black text-zinc-50">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/60 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Wrench size={24} className="text-orange-500" />
          MecaApp
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-300 hover:bg-white/5 hover:text-white"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative flex min-h-[calc(100dvh-65px)] items-center justify-center overflow-hidden">
          <AuroraCanvas className="pointer-events-none absolute inset-0 h-full w-full opacity-80" />
          <div className="pointer-events-none absolute left-1/2 top-1/3 h-[350px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/15 blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-black/60 to-black" />

          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
              </span>
              Plataforma Web Progresiva (PWA) • Tiempo Real
              <Zap size={14} className="text-orange-400" />
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Conectamos propietarios de vehículos con{" "}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                mecánicos de confianza
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
              Encuentra talleres especializados, solicita servicio a domicilio y
              gestiona el mantenimiento de tu carro o moto. Todo desde tu móvil,
              en tiempo real y con geolocalización.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.45)]"
              >
                Comenzar Ahora
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#como-funciona"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <Play
                  size={14}
                  className="text-orange-400 transition-transform duration-300 group-hover:scale-125"
                />
                Cómo Funciona
              </Link>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="relative mx-auto w-full max-w-5xl scroll-mt-24 px-6 pb-32"
        >
          <div className="pointer-events-none absolute left-1/2 top-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-orange-500/[0.06] blur-[120px]" />

          <div className="relative mb-16 flex flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-400">
              <Zap size={12} />
              Simple y rápido
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cómo{" "}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                Funciona
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-zinc-400">
              Tres pasos para tener a un mecánico de confianza en la puerta de
              tu casa.
            </p>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-500/40 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_rgba(249,115,22,0.18)]"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute -bottom-5 right-2 select-none text-7xl font-extrabold leading-none text-white/[0.04] transition-colors duration-300 group-hover:text-orange-500/10">
                    {step.number}
                  </span>

                  <div className="relative">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-orange-500/40">
                      <StepIcon size={22} />
                    </div>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 transition-colors duration-300 group-hover:text-orange-400">
                      Paso {step.number}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {step.description}
                    </p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-orange-500 to-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} MecaApp. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Instagram
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              X / Twitter
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              TikTok
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
