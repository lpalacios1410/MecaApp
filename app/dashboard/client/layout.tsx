import { requireRole } from "@/lib/auth/require-role"

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("client")

  return <>{children}</>
}