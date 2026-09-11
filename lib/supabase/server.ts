import { cache } from "react"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Las Server Components no escriben cookies directamente.
            // El proxy se encarga de refrescar la sesión.
          }
        },
      },
    }
  )
})