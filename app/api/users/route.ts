import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const [rows]: any = await pool.query("SELECT * FROM users")
    // Parse assignedStates from JSON string to array, handling empty strings
    const users = rows.map((user: any) => ({
      ...user,
      assignedStates:
        user.assignedStates.length > 0
          ? user.assignedStates
          : [],
    }))
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { email, name, role, password, assignedStates, isActive } = await req.json()

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: "Email, name, role, and password are required" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const [existingUsers]: any = await pool.execute("SELECT id FROM users WHERE email = ?", [email])
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10) // 10 es el número de rondas de sal

    const newUser = {
      id: uuidv4(),
      email,
      name,
      role,
      password: hashedPassword, // Guarda la contraseña hasheada
      assignedStates: assignedStates ? JSON.stringify(assignedStates) : null, // Stringify assignedStates
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    }
    await pool.execute(
      "INSERT INTO users (id, email, name, role, password, assignedStates, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        newUser.id,
        newUser.email,
        newUser.name,
        newUser.role,
        newUser.password,
        newUser.assignedStates,
        newUser.isActive,
      ],
    )

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

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { email, name, role, password, assignedStates, isActive } = await req.json()

    const updates: string[] = []
    const values: any[] = []

    if (email !== undefined) {
      updates.push("email = ?")
      values.push(email)
    }
    if (name !== undefined) {
      updates.push("name = ?")
      values.push(name)
    }
    if (role !== undefined) {
      updates.push("role = ?")
      values.push(role)
    }
    if (password) {
      // Hash the new password if provided
      const hashedPassword = await bcrypt.hash(password, 10)
      updates.push("password = ?")
      values.push(hashedPassword)
    }

    if (assignedStates !== undefined) {
      updates.push("assignedStates = ?")
      values.push(assignedStates === null ? null : JSON.stringify(assignedStates))
    }

    if (isActive !== undefined) {
      updates.push("isActive = ?")
      values.push(isActive)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id) // Add ID to the end for the WHERE clause
    const [result]: any = await pool.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values,
    )

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch the updated user to return
    const [updatedUserRows]: any = await pool.execute(
      "SELECT id, email, name, role, assignedStates, isActive FROM users WHERE id = ?",
      [id],
    )

    const updatedUser = {
      ...updatedUserRows[0],
      // Parse assignedStates from JSON string to array.
      // Handle cases where it might be null, an empty string, or a valid JSON string.
      assignedStates:
        typeof updatedUserRows[0].assignedStates === "string" &&
          updatedUserRows[0].assignedStates.length > 0
          ? updatedUserRows[0].assignedStates
          : [], // Default to an empty array if not a valid string or empty
    }

    return NextResponse.json(updatedUser)
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

    // Verificar si el usuario tiene casos asignados
    const [assignedCases]: any = await pool.execute("SELECT id FROM cases WHERE analystId = ? OR auditorId = ?", [
      id,
      id,
    ])

    if (assignedCases.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user: User has assigned cases. Please disable the user instead." },
        { status: 400 },
      )
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
