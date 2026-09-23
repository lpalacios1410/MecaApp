"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownToLine, ShieldCheck, Wrench } from "lucide-react"
import { setUserRole } from "@/app/dashboard/admin/users/actions"
import type { Role } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"

interface UserRowActionsProps {
  userId: string
  role: Role
  isSelf?: boolean
  canManageAdmins?: boolean
}

export function UserRowActions({
  userId,
  role,
  isSelf,
  canManageAdmins,
}: UserRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (isSelf) {
    return null
  }

  function run(next: Role) {
    startTransition(async () => {
      const result = await setUserRole(userId, next)
      if (result.status === "success") {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (role === "admin") {
    if (!canManageAdmins) {
      return null
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => run("user")}
        disabled={isPending}
      >
        <ArrowDownToLine className="h-4 w-4" />
        Degradar a cliente
      </Button>
    )
  }

  const isMechanic = role === "mechanic"

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canManageAdmins && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => run("admin")}
          disabled={isPending}
        >
          <ShieldCheck className="h-4 w-4" />
          Hacer administrador
        </Button>
      )}
      <Button
        variant={isMechanic ? "ghost" : "outline"}
        size="sm"
        className={isMechanic ? "text-destructive hover:text-destructive" : ""}
        onClick={() => run(isMechanic ? "user" : "mechanic")}
        disabled={isPending}
      >
        {isMechanic ? (
          <ArrowDownToLine className="h-4 w-4" />
        ) : (
          <Wrench className="h-4 w-4" />
        )}
        {isMechanic ? "Degradar a cliente" : "Promover a mecánico"}
      </Button>
    </div>
  )
}
