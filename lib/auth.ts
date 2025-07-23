import pool from "@/lib/db"
import { getCookieSessionPayload } from "@/lib/session-utils"
import { redirect } from "next/navigation"

export interface UserSession {
  id: string
  email: string
  name: string
  role: string
  assignedStates: string[]
  isActive: boolean
}

export async function getFullUserSession(): Promise<UserSession | null> {
  const sessionPayload = await getCookieSessionPayload()

  if (!sessionPayload) {
    return null
  }

  try {
    const [rows]: any = await pool.execute("SELECT id, email, name, role, isActive, assignedStates FROM users WHERE id = ?", [
      sessionPayload.id,
    ])
    const user = rows[0]

    if (!user) {
      return null
    }

    // Parse assignedStates from JSON string to array, handling empty strings
    const assignedStates =
      typeof user.assignedStates === "string" && user.assignedStates.length > 0 ? JSON.parse(user.assignedStates) : []

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedStates: assignedStates,
      isActive: user.isActive,
    }
  } catch (error) {
    console.error("Error fetching full user session from DB:", error)
    return null
  }
}

export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  if (requiredRoles.includes("Superusuario")) {
    return userRole === "Superusuario"
  }
  return requiredRoles.includes(userRole)
}

export async function requireAuth(requiredRoles: string[] = []) {
  const session = await getFullUserSession()

  if (!session) {
    redirect("/login")
  }

  if (requiredRoles.length > 0 && !hasRequiredRole(session.role, requiredRoles)) {
    // Redirigir a un dashboard por defecto si no tiene el rol requerido
    // O a una página de "Acceso Denegado"
    redirect("/dashboard")
  }

  return session
}
