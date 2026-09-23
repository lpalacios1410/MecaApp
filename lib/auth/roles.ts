export type Role = "user" | "mechanic" | "admin";

export function getOwnerEmail(): string {
  return (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  const owner = getOwnerEmail();
  if (!owner || !email) return false;
  return email.trim().toLowerCase() === owner;
}

export function resolveRoleFromAllowlist(email: string): Role {
  return isOwnerEmail(email) ? "admin" : "user";
}
