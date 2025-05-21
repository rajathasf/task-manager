import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is signed in and the current path is / redirect the user to /dashboard
    if (session && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // If user is not signed in and the current path is not / redirect the user to /
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error with Supabase, just continue without redirects
  }

  return res
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}
