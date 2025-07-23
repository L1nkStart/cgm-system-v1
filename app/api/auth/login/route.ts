import { NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs" // Importa bcryptjs
import { setSessionCookie } from "@/lib/session-utils"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
        }

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
        const users = rows as any[]

        if (users.length === 0) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
        }

        const user = users[0]

        // Compara la contraseña proporcionada con el hash almacenado
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
        }

        // Establece la cookie de sesión con solo el ID y email
        await setSessionCookie(user.id, user.email)

        return NextResponse.json(
            { message: "Login successful", user: { id: user.id, email: user.email, role: user.role } },
            { status: 200 },
        )
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
