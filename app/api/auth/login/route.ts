import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import pool from "@/lib/db"

const SESSION_COOKIE_NAME = "cgm_session"

interface UserSession {
    id: string
    email: string
    role: string
    assignedStates?: string[]
}

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
        }

        const [rows]: any = await pool.execute(
            "SELECT id, email, name, role, password, assignedStates FROM users WHERE email = ?",
            [email],
        )
        const user = rows[0]

        if (user && user.password === password) {
            // En una aplicación real, usarías un hash de contraseña (ej. bcrypt)
            // y compararías: await bcrypt.compare(password, user.password)

            const session: UserSession = {
                id: user.id,
                email: user.email,
                role: user.role,
                assignedStates: user.assignedStates ? user.assignedStates : [],
            }

            cookies().set(SESSION_COOKIE_NAME, JSON.stringify(session), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24, // 1 día
                path: "/",
            })

            return NextResponse.json({ success: true, message: "Login successful" })
        } else {
            return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
        }
    } catch (error) {
        console.error("Error during login API call:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
