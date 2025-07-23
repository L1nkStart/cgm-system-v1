import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "cgm_session"

interface CookieSessionPayload {
    id: string
    email: string
}

export async function getCookieSessionPayload(): Promise<CookieSessionPayload | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
        return null
    }

    try {
        const payload: CookieSessionPayload = JSON.parse(sessionCookie.value)
        return payload
    } catch (error) {
        console.error("Failed to parse session cookie:", error)
        return null
    }
}

export async function setSessionCookie(id: string, email: string): Promise<void> {
    const cookieStore = await cookies()
    const sessionPayload: CookieSessionPayload = { id, email }
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 día
        path: "/",
    })
}

export async function deleteSessionCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
}
