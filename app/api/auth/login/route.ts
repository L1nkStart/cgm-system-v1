import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { setSessionCookie } from "@/lib/session-utils" // Importa setSessionCookie

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        const [rows]: any = await pool.execute(
            "SELECT id, email, name, role, password, assignedStates FROM users WHERE email = ?",
            [email],
        )
        const user = rows[0]

        if (user && user.password === password) {
            // En una aplicación real, usarías un hash de contraseña (ej. bcrypt)
            // y compararías: await bcrypt.compare(password, user.password)

            const sessionPayload = {
                id: user.id,
                email: user.email,
            }

            await setSessionCookie(sessionPayload) // Establece la cookie con el payload mínimo

            return NextResponse.json({ success: true, message: "Login successful" }, { status: 200 })
        } else {
            return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 })
        }
    } catch (error) {
        console.error("Error during login API:", error)
        return NextResponse.json({ success: false, error: "Something went wrong." }, { status: 500 })
    }
}
