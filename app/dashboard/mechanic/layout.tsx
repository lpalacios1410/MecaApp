import { requireRole } from "@/lib/auth/require-role"

export default async function MechanicDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("mechanic")

  return <>{children}</>
}