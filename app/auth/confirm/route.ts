import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

function resolveSafeNext(requestedNext: string | null, requestUrl: string) {
  if (!requestedNext) {
    return "/login"
  }

  try {
    const target = new URL(requestedNext, requestUrl)
    if (target.origin === new URL(requestUrl).origin) {
      return `${target.pathname}${target.search}${target.hash}`
    }
  } catch {
    // URL inválida
  }

  return "/login"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const requestedNext = searchParams.get("next")
  const next = resolveSafeNext(requestedNext, request.url)

  if (tokenHash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=No se pudo confirmar el correo", request.url)
  )
}