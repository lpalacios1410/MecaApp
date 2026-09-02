
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-50">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">
          MecaApp
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full transition-colors hover:bg-zinc-200"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400">
          Plataforma Web Progresiva (PWA)
        </span>
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Conectamos propietarios de vehículos con{" "}
          <span className="text-orange-500">mecánicos de confianza</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
          Encuentra talleres especializados, solicita servicio a domicilio y
          gestiona el mantenimiento de tu carro o moto. Todo desde tu móvil,
          en tiempo real y con geolocalización.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="px-8 py-3 text-sm font-semibold bg-orange-500 text-black rounded-full transition-colors hover:bg-orange-400"
          >
            Comenzar Ahora
          </Link>
          <Link
            href="#como-funciona"
            className="px-8 py-3 text-sm font-semibold border border-zinc-700 text-zinc-300 rounded-full transition-colors hover:border-zinc-500 hover:text-white"
          >
            Cómo Funciona
          </Link>
        </div>

        <section id="como-funciona" className="mt-32 w-full max-w-5xl">
          <h3 className="text-2xl font-bold mb-12">Cómo Funciona</h3>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                1
              </div>
              <h4 className="text-lg font-semibold">Regístrate</h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Crea tu cuenta como propietario o mecánico en segundos.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                2
              </div>
              <h4 className="text-lg font-semibold">Encuentra un Mecánico</h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Explora el directorio con geolocalización, filtra por
                especialidad y zona.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                3
              </div>
              <h4 className="text-lg font-semibold">Agenda tu Servicio</h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Solicita cita, domicilio o auxilio vial. Todo desde la app.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-8">
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
