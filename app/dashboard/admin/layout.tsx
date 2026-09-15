import { requireRole } from "@/lib/auth/require-role"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("admin")

  return <>{children}</>
}
