// app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import pool from "@/lib/db" // ¡Aquí sí se puede importar!

const SESSION_COOKIE_NAME = "cgm_session"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()
        const cookie = await cookies()

        if (!email || !password) {
            return NextResponse.json({ message: "Correo y contraseña son requeridos" }, { status: 400 })
        }

        const [rows]: any = await pool.execute("SELECT id, email, role, password FROM users WHERE email = ?", [email])
        const user = rows[0]

        if (user && user.password === password) {
            // **REALMENTE USAR BCrypt o Argon2 AQUÍ**
            // if (!(await bcrypt.compare(password, user.password))) {
            //   return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
            // }

            const session = { id: user.id, email: user.email, role: user.role }
            cookie.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24, // 1 día
                path: "/",
            })

            return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 200 })
        } else {
            return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
        }
    } catch (error) {
        console.error("Error en la API de login:", error)
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
    }
}