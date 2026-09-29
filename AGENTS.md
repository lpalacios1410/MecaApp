# AGENTS.md

## Comandos
- El gestor de paquetes es **pnpm** (`pnpm-lock.yaml`). No uses npm/yarn.
- `pnpm dev` · `pnpm build` · `pnpm start`
- `pnpm lint` → `eslint .` (sin autofix).
- **No hay suite de tests ni script de typecheck independiente**; TypeScript se verifica durante `pnpm build`. Verifica los cambios con `pnpm lint` y luego `pnpm build`.
- `pnpm analyze` → analizador de bundle (`ANALYZE=true next build`). No hay CI ni hooks de pre-commit configurados.

## Entorno
- Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (exactamente este nombre, **no** `..._ANON_KEY`). Opcional: `NEXT_PUBLIC_SITE_URL` (origen de redirección de emails de auth); Vercel provee `VERCEL_URL`.
- Secretos solo de servidor: `SUPABASE_SERVICE_ROLE_KEY` (usado por `lib/supabase/admin.ts` para asignar roles y saltar el RLS desde código de servidor confiable; nunca lo prefijes con `NEXT_PUBLIC`). `OWNER_EMAIL` es la única cuenta global/owner por instancia: el signup la promueve a `admin`, y solo ella puede promover/degradar otros admins desde la UI de administración de usuarios (los admins promovidos gestionan mecánicos/usuarios). Los nuevos registros siempre son `user`, salvo que coincidan con `OWNER_EMAIL`. SaaS multi-instancia: un proyecto Supabase + un `.env` por cliente (ver el runbook del README; los `.env` nunca se commitean).
- El README está desactualizado: dice Next 15 + HeroUI, pero la app es **Next.js 16 (Turbopack)** con shadcn/Radix y React 19.

## Arquitectura
- Solo App Router. Las lecturas de datos viven en `lib/supabase/helpers.ts` (memoizadas con `React.cache`); prefíerelas sobre consultas ad-hoc de Supabase en las rutas. Los helpers de lista distinguen "vacío" de "error" lanzando excepciones (capturadas por `app/error.tsx`).
- Sesiones SSR por cookies de Supabase: `lib/supabase/server.ts` (servidor, cacheado), `lib/supabase/client.ts` (navegador), `lib/supabase/proxy.ts` (`updateSession`, invocado desde el `proxy.ts` de la raíz).
- `proxy.ts` en la raíz del repo es el middleware de Next 16 (renombrado desde `middleware.ts`); mantenlo en la raíz. Está en los ignores de `eslint.config.mjs`.
- Auth/roles: `user | mechanic | admin`. Grupos de rutas `app/(auth)` y `app/dashboard/{client,mechanic,admin}`. Protege con `requireRole(...)` en los layouts de `client`/`mechanic`/`admin`; las server actions lo re-verifican. `lib/auth/roles.ts` mapea emails a roles.
- Las páginas del dashboard usan `await connection()` para forzar renderizado dinámico. Consérvalo al agregar páginas con datos, o Next podría optimizarlas estáticamente.
- El esquema de BD es `supabase-schema.sql` en la raíz del repo (idempotente, no es una carpeta de migraciones) y se aplica manualmente en el editor SQL de Supabase; las políticas RLS, índices y triggers de validación viven ahí. Para bases de datos existentes aplica SQL de migración puntual localmente (fuera de git; copia las secciones relevantes de `supabase-schema.sql`).
- Los planes viven en la tabla `plans` de Supabase (catálogo global). `getActivePlans()`/`getAllPlans()` en `lib/supabase/helpers.ts` son la fuente de datos; `lib/plans-data.ts` solo contiene tipos. **Solo los admins** gestionan el catálogo vía `app/dashboard/admin/plans`; los mecánicos solo lo leen. Las `orders` snapshot `plan_id`/`plan_name`/`plan_price_usd`, por lo que editar o eliminar un plan no altera órdenes existentes. `get_plan_order_counts()` (SECURITY DEFINER, restringida a admins) impide eliminar planes con órdenes.
- La seguridad de perfiles se aplica en la BD: `prevent_profile_privilege_escalation` bloquea escrituras de `role`/`email` que no vengan del `service_role`, y `validate_order` deriva los datos del plan y verifica propiedad/roles al insertar, de modo que PostgREST no puede saltarse las server actions.

## Convenciones / gotchas
- `@/*` mapea a la raíz del repo (ver `tsconfig.json`).
- Tailwind **v3.4** (no v4) + shadcn "new-york". Los tokens del tema son variables CSS HSL en `app/globals.css`. El modo oscuro está hardcodeado con `<html className="dark">`; no hay ThemeProvider/`next-themes`.
- `components/ui` en su mayoría importa paquetes individuales `@radix-ui/react-*`; `sheet.tsx` usa el subpath `radix-ui/dialog`. Mantén los imports directos/de subpath — evita el barrel `radix-ui`, que infla el bundle.
- `.agents/` y `skills-lock.json` son skills instaladas, no código de la app, y están excluidas de ESLint. No los edites.
- El copy de la UI, los comentarios y las redirecciones se escriben en español.
- Usa `Promise.all` para fetches de servidor independientes; las llamadas a auth/helpers están cacheadas por request, así que llamarlas varias veces por request es barato.
