import Link from "next/link";
import { connection } from "next/server";
import { Users } from "lucide-react";
import { getUserProfile, getUsersPage } from "@/lib/supabase/helpers";
import { isOwnerEmail, type Role } from "@/lib/auth/roles";
import { UserRowActions } from "@/components/dashboard/admin/user-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ROLE_LABELS: Record<Role, string> = {
  user: "Cliente",
  mechanic: "Mecánico",
  admin: "Administrador",
};

const ROLE_VARIANTS: Record<Role, "default" | "secondary" | "outline"> = {
  user: "secondary",
  mechanic: "default",
  admin: "outline",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "user", label: "Clientes" },
  { value: "mechanic", label: "Mecánicos" },
  { value: "admin", label: "Administradores" },
];

function parseRole(value: string | undefined): Role | undefined {
  if (value === "user" || value === "mechanic" || value === "admin") {
    return value;
  }
  return undefined;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>;
}) {
  await connection();
  const { page: pageParam, role: roleParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const roleFilter = parseRole(roleParam);

  const [profile, { items: users, total, totalPages }] = await Promise.all([
    getUserProfile(),
    getUsersPage(page, 12, roleFilter),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Usuarios Registrados</h2>
        <p className="text-muted-foreground">
          Gestiona los roles de las cuentas de la plataforma
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === (roleParam ?? "");
          return (
            <Link
              key={filter.value || "all"}
              href={
                filter.value
                  ? `/dashboard/admin/users?role=${filter.value}`
                  : "/dashboard/admin/users"
              }
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
              >
                {filter.label}
              </Button>
            </Link>
          );
        })}
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No hay usuarios que mostrar</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex flex-col items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {user.full_name?.trim() || "Sin nombre"}
                      </CardTitle>
                      <CardDescription className="break-words">
                        {user.email}
                      </CardDescription>
                    </div>
                    <Badge variant={ROLE_VARIANTS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground">
                    Registrado:{" "}
                    {new Date(user.created_at).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <UserRowActions
                    userId={user.id}
                    role={user.role}
                    isSelf={user.id === profile.id}
                    canManageAdmins={isOwnerEmail(profile.email)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {total} usuario{total !== 1 ? "s" : ""} · página {page} de{" "}
              {totalPages}
            </p>
            <div className="flex justify-center gap-2">
              <Link
                href={`/dashboard/admin/users?page=${page - 1}${roleFilter ? `&role=${roleFilter}` : ""}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Anterior
                </Button>
              </Link>
              <Link
                href={`/dashboard/admin/users?page=${page + 1}${roleFilter ? `&role=${roleFilter}` : ""}`}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                  Siguiente
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
