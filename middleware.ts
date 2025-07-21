// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, hasRequiredRole } from "@/lib/auth"; // Importa getSession y hasRequiredRole

// Define los roles permitidos para cada ruta
const protectedRoutes: { [key: string]: string[] } = {
  "/dashboard": ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"],
  "/users": ["Superusuario"],
  "/cases/new": ["Superusuario", "Coordinador Regional"],
  "/cases": ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor"],
  "/analyst-dashboard": ["Analista Concertado"],
  "/auditor-dashboard": ["Médico Auditor"],
  "/cancelled-cases": [
    "Superusuario",
    "Coordinador Regional",
    "Analista Concertado",
    "Médico Auditor",
    "Jefe Financiero",
  ],
  "/invoices": ["Superusuario", "Jefe Financiero"],
  "/incurred-fund": ["Superusuario", "Jefe Financiero"],
  "/payments": ["Superusuario", "Jefe Financiero"],
  "/baremos": ["Superusuario", "Coordinador Regional"],
  "/baremos/client": ["Superusuario", "Coordinador Regional"], // Dynamic route prefix
};

const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  // Pasa el objeto `request` a getSession para que pueda leer la cookie del request de middleware
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  // Si la ruta es pública, permite el acceso
  if (publicRoutes.includes(pathname)) {
    // Si ya está logueado y trata de ir a /login, redirige a /dashboard
    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Si no hay sesión, redirige a /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar roles para rutas protegidas
  let requiredRoles: string[] | undefined;

  // Manejar rutas dinámicas como /cases/[id] o /baremos/client/[clientName]
  const dynamicRoutePrefixes = Object.keys(protectedRoutes).filter(
    (route) => route.endsWith("/[") || route.endsWith("/client")
  );
  const matchedDynamicRoute = dynamicRoutePrefixes.find((prefix) => pathname.startsWith(prefix.replace("/[", "")));

  if (matchedDynamicRoute) {
    requiredRoles = protectedRoutes[matchedDynamicRoute];
  } else {
    requiredRoles = protectedRoutes[pathname];
  }

  if (requiredRoles) {
    if (!hasRequiredRole(session.role, requiredRoles)) {
      // Si el usuario no tiene el rol requerido, redirige a una página de acceso denegado o al dashboard
      console.warn(
        `Acceso denegado para usuario ${session.email} (rol: ${session.role}) a ${pathname}. Roles requeridos: ${requiredRoles.join(", ")}`
      );
      return NextResponse.redirect(new URL("/dashboard", request.url)); // O a una página de error 403
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|citamed-logo.png).*)"],
};