"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Car, LayoutDashboard, Wrench, LogOut, Menu, Toolbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as React from "react";

interface DashboardSidebarProps {
  role: "user" | "mechanic";
}

const navItemsByRole = {
  user: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/client/vehicles", label: "Mis Vehículos", icon: Car },
    { href: "/dashboard/client/plans", label: "Planes", icon: Sparkles },
  ],
  mechanic: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/mechanic", label: "Dashboard Mechanic", icon: Toolbox },
    { href: "/dashboard/mechanic/plans", label: "Planes", icon: Wrench },
    { href: "/dashboard/mechanic/orders", label: "Órdenes", icon: Car },
  ],
};

function SidebarContent({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const items = navItemsByRole[role];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Wrench className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">MecaApp</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive =
             pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-background">
        <SidebarContent role={role} />
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SidebarContent role={role} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
