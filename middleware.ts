import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCookieSessionPayload } from "@/lib/session-utils" // Importa getCookieSessionPayload

// Define las rutas que requieren cualquier sesión (no se verifican roles aquí)
const protectedRoutes = [
  "/dashboard",
  "/users",
  "/cases/new",
  "/cases",
  "/analyst-dashboard",
  "/auditor-dashboard",
  "/cancelled-cases",
  "/invoices",
  "/incurred-fund",
  "/payments",
  "/baremos",
  "/baremos/client", // Dynamic route prefix
]

const publicRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const sessionPayload = await getCookieSessionPayload() // Obtiene solo el ID y email de la cookie
  const { pathname } = request.nextUrl

  // Si la ruta es pública, permite el acceso
  if (publicRoutes.includes(pathname)) {
    // Si ya está logueado y trata de ir a /login, redirige a /dashboard
    if (sessionPayload && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // Si la ruta es protegida (requiere cualquier sesión)
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.endsWith("/client")) {
      return pathname.startsWith(route)
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })

  if (isProtectedRoute) {
    // Si no hay sesión, redirige a /login
    if (!sessionPayload) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Si hay sesión o la ruta no es protegida, permite el acceso
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|citamed-logo.png).*)"],
}
