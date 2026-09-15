"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDownToLine, Wrench } from "lucide-react"
import { setUserRole } from "@/app/dashboard/admin/users/actions"
import type { Role } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"

interface UserRowActionsProps {
  userId: string
  role: Role
  isSelf?: boolean
}

export function UserRowActions({ userId, role, isSelf }: UserRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (role === "admin" || isSelf) {
    return null
  }

  const isMechanic = role === "mechanic"

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

  return (
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
  )
}
