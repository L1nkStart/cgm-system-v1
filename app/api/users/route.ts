import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT id, email, name, role FROM users")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { email, name, role, password } = await req.json()

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: "Email, name, role, and password are required" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const [existingUsers]: any = await pool.execute("SELECT id FROM users WHERE email = ?", [email])
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const newUser = { id: uuidv4(), email, name, role, password }
    await pool.execute("INSERT INTO users (id, email, name, role, password) VALUES (?, ?, ?, ?, ?)", [
      newUser.id,
      newUser.email,
      newUser.name,
      newUser.role,
      newUser.password,
    ])

    const { password: _, ...userWithoutPassword } = newUser // Excluir password de la respuesta
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const { email, name, role, password } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (email) {
      updates.push("email = ?")
      values.push(email)
    }
    if (name) {
      updates.push("name = ?")
      values.push(name)
    }
    if (role) {
      updates.push("role = ?")
      values.push(role)
    }
    if (password) {
      updates.push("password = ?")
      values.push(password)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const [result]: any = await pool.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch the updated user to return
    const [updatedUserRows]: any = await pool.execute("SELECT id, email, name, role FROM users WHERE id = ?", [id])
    return NextResponse.json(updatedUserRows[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const [result]: any = await pool.execute("DELETE FROM users WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
