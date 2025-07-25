import "server-only"
import pool from "@/lib/db" // Importa el pool de conexiones
import { getCookieSessionPayload } from "@/lib/session-utils" // Importa la función para obtener el payload de la cookie
import { redirect } from "next/navigation"

export interface UserSession {
  id: string
  email: string
  name: string
  role: string
  assignedStates: string[]
  isActive: boolean // Añadido el campo isActive
}

/**
 * Obtiene la sesión completa del usuario consultando la base de datos.
 * Esta función solo debe usarse en Server Components o Route Handlers.
 */
export async function getFullUserSession(): Promise<UserSession | null> {
  const sessionPayload = await getCookieSessionPayload() // Obtiene el payload mínimo de la cookie

  if (!sessionPayload?.id) {
    return null
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT id, email, name, role, assignedStates, isActive FROM users WHERE id = ?",
      [sessionPayload.id],
    )
    const user = rows[0]

    if (!user) {
      return null
    }

    // Parse assignedStates from JSON string to array, handling empty strings
    const assignedStates =
      user.assignedStates.length > 0 ? user.assignedStates : []

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedStates: assignedStates,
      isActive: user.isActive, // Incluye isActive
    }
  } catch (error) {
    console.error("Error fetching full user session from DB:", error)
    return null
  }
}

/**
 * Verifica si el usuario tiene uno de los roles requeridos.
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  // Si no se especifican roles requeridos, cualquier usuario autenticado es permitido.
  if (requiredRoles.length === 0) {
    return true
  }
  // Verifica si el rol del usuario está incluido en la lista de roles requeridos.
  return requiredRoles.includes(userRole)
}

/**
 * Función de utilidad para proteger rutas de Server Components.
 * Redirige si no hay sesión o si el rol no es el requerido.
 */
export async function requireAuth(requiredRoles: string[] = []) {
  const session = await getFullUserSession()

  if (!session) {
    redirect("/login")
  }

  if (requiredRoles.length > 0 && !hasRequiredRole(session.role, requiredRoles)) {
    // Redirigir a un dashboard por defecto si no tiene el rol requerido
    // O a una página de "Acceso Denegado"
    redirect("/dashboard") // O a una página de acceso denegado
  }

  return session
}
