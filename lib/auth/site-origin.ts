import { headers } from "next/headers";

export async function resolveSiteOrigin(): Promise<string> {
  const headerList = await headers();

  const allowedOrigins = new Set(
    [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      "http://localhost:3000",
    ].filter((value): value is string => Boolean(value))
  );
  const requestOrigin = headerList.get("origin");

  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (requestOrigin && allowedOrigins.has(requestOrigin)
      ? requestOrigin
      : "http://localhost:3000")
  );
}
