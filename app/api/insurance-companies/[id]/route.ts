import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Solo Superusuario y Jefe Financiero pueden acceder
        if (!["Superusuario", "Jefe Financiero"].includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const [rows]: any = await pool.execute(
            `SELECT 
        id,
        name,
        rif,
        phone,
        email,
        address,
        contactPerson,
        contactPhone,
        contactEmail,
        isActive,
        createdAt,
        updatedAt
       FROM insurance_companies 
       WHERE id = ?`,
            [params.id],
        )

        if (rows.length === 0) {
            return NextResponse.json({ error: "Insurance company not found" }, { status: 404 })
        }

        return NextResponse.json(rows[0])
    } catch (error) {
        console.error("Error fetching insurance company:", error)
        return NextResponse.json({ error: "Error fetching insurance company" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Solo Superusuario y Jefe Financiero pueden modificar
        if (!["Superusuario", "Jefe Financiero"].includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { name, rif, phone, email, address, contactPerson, contactPhone, contactEmail, isActive } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const [result]: any = await pool.execute(
            `UPDATE insurance_companies 
       SET name = ?, rif = ?, phone = ?, email = ?, address = ?, 
           contactPerson = ?, contactPhone = ?, contactEmail = ?, isActive = ?
       WHERE id = ?`,
            [name, rif, phone, email, address, contactPerson, contactPhone, contactEmail, isActive, params.id],
        )

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance company not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Insurance company updated successfully" })
    } catch (error: any) {
        console.error("Error updating insurance company:", error)

        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "RIF already exists" }, { status: 409 })
        }

        return NextResponse.json({ error: "Error updating insurance company" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Solo Superusuario puede eliminar
        if (session.role !== "Superusuario") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // En lugar de eliminar, inactivamos la compañía
        const [result]: any = await pool.execute("UPDATE insurance_companies SET isActive = FALSE WHERE id = ?", [
            params.id,
        ])

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance company not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Insurance company deactivated successfully" })
    } catch (error) {
        console.error("Error deactivating insurance company:", error)
        return NextResponse.json({ error: "Error deactivating insurance company" }, { status: 500 })
    }
}
