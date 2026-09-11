# AGENTS.md

## Commands
- Package manager is **pnpm** (`pnpm-lock.yaml`). Do not use npm/yarn.
- `pnpm dev` · `pnpm build` · `pnpm start`
- `pnpm lint` → `eslint .` (no autofix).
- There is **no test suite and no standalone typecheck script**; TypeScript is checked during `pnpm build`. Verify changes with `pnpm lint` then `pnpm build`.
- `pnpm analyze` → bundle analyzer (`ANALYZE=true next build`). No CI or pre-commit hooks are configured.

## Environment
- Needs `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (this exact name, **not** `..._ANON_KEY`). Optional: `NEXT_PUBLIC_SITE_URL` (auth email redirect origin); Vercel provides `VERCEL_URL`.
- README is stale: it claims Next 15 + HeroUI, but the app is **Next.js 16 (Turbopack)** using shadcn/Radix.

## Architecture
- App Router only. Data reads live in `lib/supabase/helpers.ts` (memoized with `React.cache`); prefer these over ad-hoc Supabase queries in routes.
- Supabase SSR cookie sessions: `lib/supabase/server.ts` (server, cached), `lib/supabase/client.ts` (browser), `lib/supabase/proxy.ts` (`updateSession`, called from the root `proxy.ts`).
- `proxy.ts` at repo root is Next 16's middleware (renamed from `middleware.ts`); keep it at root. It is in `eslint.config.mjs` ignores.
- Auth/roles: route groups `app/(auth)` and `app/dashboard/{client,mechanic}`. Gate with `requireRole(...)` in the `client`/`mechanic` layouts; server actions re-check it.
- Dashboard pages `await connection()` to force dynamic rendering. Keep this when adding data pages, or Next may statically optimize them.
- DB schema is `supabase-schema.sql` at repo root (not a migrations folder) and is applied manually in the Supabase SQL editor; RLS policies and indexes live there.
- `orders` snapshot plan data from static `lib/plans-data.ts`; editing a plan in code does not change existing orders.

## Conventions / gotchas
- `@/*` maps to the repo root (see `tsconfig.json`).
- Tailwind **v3** (not v4) + shadcn "new-york". Theme tokens are HSL CSS vars in `app/globals.css`. Dark mode is hardcoded via `<html className="dark">`; there is no ThemeProvider/`next-themes`.
- `components/ui` mostly imports individual `@radix-ui/react-*`; `sheet.tsx` uses the subpath `radix-ui/dialog`. Keep direct/subpath imports — avoid the `radix-ui` barrel, which bloats the bundle.
- `.agents/` and `skills-lock.json` are installed skills, not app code, and are excluded from ESLint. Do not edit them.
- UI copy, comments, and redirects are written in Spanish.
- Use `Promise.all` for independent server fetches; the auth/helper calls are request-cached, so calling them multiple times per request is cheap.
