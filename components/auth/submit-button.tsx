"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-sm font-semibold text-black shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-orange-400 hover:to-amber-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.45)] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </Button>
  );
}
