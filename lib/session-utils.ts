import { cookies } from "next/headers"

export const SESSION_COOKIE_NAME = "cgm_session"

// Define la interfaz para el payload mínimo de la cookie
export interface CookieSessionPayload {
    id: string
    email: string
}

/**
 * Establece la cookie de sesión con el payload mínimo.
 * Compatible con Edge Runtime.
 */
export async function setSessionCookie(payload: CookieSessionPayload) {
    const cookie = await cookies()

    cookie.set(SESSION_COOKIE_NAME, JSON.stringify(payload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 día
        path: "/",
    })
}

/**
 * Obtiene el payload mínimo de la sesión directamente de la cookie.
 * Compatible con Edge Runtime.
 */
export async function getCookieSessionPayload(): Promise<CookieSessionPayload | null> {
    const cookie = await cookies()
    const sessionCookie = cookie.get(SESSION_COOKIE_NAME)
    if (sessionCookie) {
        try {
            return JSON.parse(sessionCookie.value) as CookieSessionPayload
        } catch (error) {
            console.error("Error parsing session cookie:", error)
            return null
        }
    }
    return null
}

/**
 * Elimina la cookie de sesión.
 * Compatible con Edge Runtime.
 */
export async function deleteSessionCookie() {
    const cookie = await cookies()
    cookie.delete(SESSION_COOKIE_NAME)
}
