import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCookieSessionPayload } from "@/lib/session-utils"

export async function middleware(request: NextRequest) {
  const sessionPayload = await getCookieSessionPayload()
  const { pathname } = request.nextUrl

  // // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/api/auth/login"]

  // Si la ruta es pública, permite el acceso
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Si no hay sesión y la ruta no es pública, redirige a login
  if (!sessionPayload) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Si hay sesión, permite el acceso a rutas protegidas
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
