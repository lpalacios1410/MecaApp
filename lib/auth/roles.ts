export type Role = "user" | "mechanic" | "admin";

function parseEmailList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRoleFromAllowlist(email: string): Role {
  const normalized = email.trim().toLowerCase();

  if (parseEmailList(process.env.ADMIN_EMAILS).includes(normalized)) {
    return "admin";
  }

  if (parseEmailList(process.env.MECHANIC_EMAILS).includes(normalized)) {
    return "mechanic";
  }

  return "user";
}
