import { logoutAction } from "@/app/actions"
import pool from "@/lib/db" // Importa el pool de conexiones
import { getCookieSessionPayload } from "@/lib/session-utils" // Importa la función para obtener el payload de la cookie

// Define la interfaz completa de la sesión que se devuelve (incluye datos de DB)
export interface UserSession {
  id: string
  email: string
  role: string
  assignedStates?: string[]
}

/**
 * Obtiene la sesión completa del usuario consultando la base de datos.
 * Esta función solo debe usarse en Server Components o Route Handlers.
 */
export async function getFullUserSession(): Promise<UserSession | null> {
  const sessionData = await getCookieSessionPayload() // Obtiene el payload mínimo de la cookie

  if (sessionData) {
    try {
      const [rows]: any = await pool.execute("SELECT id, email, name, role, assignedStates FROM users WHERE id = ?", [
        sessionData.id,
      ])
      const user = rows[0]

      if (user) {
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          assignedStates: user.assignedStates ? user.assignedStates : [],
        }
      } else {
        console.warn("User not found in DB for session ID:", sessionData.id)
        return null
      }
    } catch (error) {
      console.error("Error fetching full user data from DB:", error)
      return null
    }
  }
  return null
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
