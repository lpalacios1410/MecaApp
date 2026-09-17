import Link from "next/link";
import { Wrench } from "lucide-react";
import { AuroraCanvas } from "@/components/aurora-canvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const authInputClass =
  "h-11 rounded-lg border-white/10 bg-white/[0.04] text-zinc-100 placeholder:text-zinc-600 transition-colors focus-visible:border-orange-500/50 focus-visible:ring-1 focus-visible:ring-orange-500/30";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black p-4">
      <AuroraCanvas className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_75%)]" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="group mx-auto mb-8 flex w-fit items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-orange-500/50">
            <Wrench size={20} className="text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            MecaApp
          </span>
        </Link>

        <Card className="rounded-2xl border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} MecaApp
        </p>
      </div>
    </main>
  );
}
