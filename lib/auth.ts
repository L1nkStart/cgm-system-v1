// import { cookies } from "next/headers"
// import { redirect } from "next/navigation"
// import pool from "@/lib/db" // Importa el pool de conexiones

// const SESSION_COOKIE_NAME = "cgm_session"

// interface UserSession {
//   id: string
//   email: string
//   role: string
// }

// /**
//  * Simula el inicio de sesión de un usuario.
//  * Ahora valida credenciales contra la base de datos.
//  */
// export async function login(email: string, password: string): Promise<UserSession | null> {
//   try {
//     const [rows]: any = await pool.execute("SELECT id, email, role, password FROM users WHERE email = ?", [email])
//     const user = rows[0]
//     const cookie = await cookies()


//     if (user && user.password === password) {
//       // En una aplicación real, usarías un hash de contraseña (ej. bcrypt)
//       // y compararías: await bcrypt.compare(password, user.password)

//       const session: UserSession = { id: user.id, email: user.email, role: user.role }
//       cookie.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 60 * 60 * 24, // 1 día
//         path: "/",
//       })
//       return session
//     }
//     return null
//   } catch (error) {
//     console.error("Error during login:", error)
//     return null
//   }
// }

// /**
//  * Simula el cierre de sesión.
//  */
// export async function logout() {
//   const cookie = await cookies()
//   cookie.delete(SESSION_COOKIE_NAME)
//   redirect("/login")
// }

// /**
//  * Obtiene la sesión del usuario actual desde las cookies.
//  */
// export async function getSession(): Promise<UserSession | null> {
//   const cookie = await cookies()
//   const sessionCookie = cookie.get(SESSION_COOKIE_NAME)
//   if (sessionCookie) {
//     try {
//       return JSON.parse(sessionCookie.value) as UserSession
//     } catch (error) {
//       console.error("Error parsing session cookie:", error)
//       return null
//     }
//   }
//   return null
// }

// /**
//  * Verifica si el usuario tiene uno de los roles requeridos.
//  */
// export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
//   if (requiredRoles.length === 0) {
//     return true // No se requieren roles específicos, acceso permitido
//   }
//   return requiredRoles.includes(userRole)
// }

// lib/auth.ts (Actualizado para el manejo de sesión sin DB)
// Este archivo NO DEBE importar pool directamente.
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
// import pool from "@/lib/db" // Importa el pool de conexiones

const SESSION_COOKIE_NAME = "cgm_session"

interface UserSession {
  id: string
  email: string
  role: string
  assignedStates?: string[] // Add assignedStates to the session
}

// /**
//  * Simula el inicio de sesión de un usuario.
//  * Ahora valida credenciales contra la base de datos.
//  */
// export async function login(email: string, password: string): Promise<UserSession | null> {
//   try {
//     const cookie = await cookies()
//     const [rows]: any = await pool.execute(
//       "SELECT id, email, name, role, password, assignedStates FROM users WHERE email = ?",
//       [email],
//     )
//     const user = rows[0]

//     if (user && user.password === password) {
//       // En una aplicación real, usarías un hash de contraseña (ej. bcrypt)
//       // y compararías: await bcrypt.compare(password, user.password)

//       const session: UserSession = {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         assignedStates: user.assignedStates || [], // Ensure it's an array, even if null in DB
//       }
//       cookie.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 60 * 60 * 24, // 1 día
//         path: "/",
//       })
//       return session
//     }
//     return null
//   } catch (error) {
//     console.error("Error during login:", error)
//     return null
//   }
// }

// /**
//  * Simula el cierre de sesión.
//  */
// export async function logout() {
//   const cookie = await cookies()
//   cookie.delete(SESSION_COOKIE_NAME)
//   redirect("/login")
// }

// /**
//  * Obtiene la sesión del usuario actual desde las cookies.
//  */
// export async function getSession(): Promise<UserSession | null> {
//   const cookie = await cookies()
//   const sessionCookie = cookie.get(SESSION_COOKIE_NAME)
//   if (sessionCookie) {
//     try {
//       const sessionData = JSON.parse(sessionCookie.value) as UserSession
//       // Re-fetch user data from DB to ensure assignedStates is up-to-date
//       const [rows]: any = await pool.execute("SELECT id, email, name, role, assignedStates FROM users WHERE id = ?", [
//         sessionData.id,
//       ])
//       const user = rows[0]
//       if (user) {
//         return {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//           assignedStates: user.assignedStates || [],
//         }
//       }
//       return null
//     } catch (error) {
//       console.error("Error parsing session cookie or fetching user data:", error)
//       return null
//     }
//   }
//   return null
// }

/**
 * Obtiene la sesión del usuario actual desde las cookies.
 *
 * Puede ser llamada en:
 * - Middleware (requiere que se le pase el objeto `request` si usa `NextRequest.cookies`)
 * - Server Components (usa `cookies()` de `next/headers`)
 * - API Routes (usa `cookies()` de `next/headers` o `req.cookies` en Pages Router)
 */
export async function getSession(request?: NextRequest): Promise<UserSession | null> {
  let sessionCookieValue: string | undefined;
  const cookie = await cookies(); // Obtiene la instancia de cookies

  // Adaptación para obtener la cookie dependiendo del contexto
  if (request) {
    // Contexto de Middleware
    sessionCookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    // Contexto de Server Component / API Route (App Router)
    try {
      sessionCookieValue = cookie.get(SESSION_COOKIE_NAME)?.value;
    } catch (e) {
      // Manejar el error si cookies() se llama en un contexto no válido (ej. Client Component)
      console.error("Error al acceder a cookies() fuera del contexto de servidor:", e);
      return null;
    }
  }

  if (sessionCookieValue) {
    try {
      return JSON.parse(sessionCookieValue) as UserSession;
    } catch (error) {
      console.error("Error al parsear la cookie de sesión:", error);
      return null;
    }
  }
  return null;
}

/**
 * Verifica si el usuario tiene uno de los roles requeridos.
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) {
    return true // No se requieren roles específicos, acceso permitido
  }
  return requiredRoles.includes(userRole)
}
