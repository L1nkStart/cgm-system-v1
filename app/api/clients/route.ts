import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const [rows]: any = await pool.execute(`
      SELECT 
        c.*,
        b.name as baremoName,
        b.clinicName as baremoClinicName
      FROM clients c
      LEFT JOIN baremos b ON c.baremoId = b.id
      WHERE c.isActive = TRUE
      ORDER BY c.name ASC
    `)

        return NextResponse.json(rows)
    } catch (error) {
        console.error("Error fetching clients:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getFullUserSession()
        if (!session || (session.role !== "Superusuario" && session.role !== "Jefe Financiero")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const {
            name,
            insuranceCompany,
            rif,
            address,
            phone,
            email,
            contactPerson,
            contactPhone,
            contactEmail,
            baremoId,
            notes,
        } = body

        if (!name || !rif) {
            return NextResponse.json({ error: "Nombre y RIF son requeridos" }, { status: 400 })
        }

        const id = uuidv4()
        await pool.execute(
            `INSERT INTO clients (
        id, name, insuranceCompany, rif, address, phone, email, contactPerson, 
        contactPhone, contactEmail, baremoId, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                name,
                insuranceCompany,
                rif,
                address,
                phone,
                email,
                contactPerson,
                contactPhone,
                contactEmail,
                baremoId,
                notes,
            ],
        )

        return NextResponse.json({ success: true, message: "Cliente creado exitosamente" })
    } catch (error: any) {
        console.error("Error creating client:", error)
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "El RIF ya está registrado" }, { status: 400 })
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getFullUserSession()
        if (!session || (session.role !== "Superusuario" && session.role !== "Jefe Financiero")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID del cliente es requerido" }, { status: 400 })
        }

        const body = await request.json()
        const {
            name,
            insuranceCompany,
            rif,
            address,
            phone,
            email,
            contactPerson,
            contactPhone,
            contactEmail,
            baremoId,
            isActive,
            notes,
        } = body

        if (!name || !rif) {
            return NextResponse.json({ error: "Nombre y RIF son requeridos" }, { status: 400 })
        }

        await pool.execute(
            `UPDATE clients SET 
        name = ?, insuranceCompany = ?, rif = ?, address = ?, phone = ?, email = ?, 
        contactPerson = ?, contactPhone = ?, contactEmail = ?, 
        baremoId = ?, isActive = ?, notes = ?
      WHERE id = ?`,
            [
                name,
                insuranceCompany,
                rif,
                address,
                phone,
                email,
                contactPerson,
                contactPhone,
                contactEmail,
                baremoId,
                isActive,
                notes,
                id,
            ],
        )

        return NextResponse.json({ success: true, message: "Cliente actualizado exitosamente" })
    } catch (error: any) {
        console.error("Error updating client:", error)
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "El RIF ya está registrado" }, { status: 400 })
        }
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getFullUserSession()
        if (!session || session.role !== "Superusuario") {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID del cliente es requerido" }, { status: 400 })
        }

        // Check if client has associated cases
        const [caseRows]: any = await pool.execute(
            "SELECT COUNT(*) AS count FROM cases WHERE client = (SELECT name FROM clients WHERE id = ?)",
            [id],
        )

        if (caseRows[0].count > 0) {
            return NextResponse.json(
                { error: "No se puede eliminar el cliente porque tiene casos asociados" },
                { status: 400 },
            )
        }

        await pool.execute("DELETE FROM clients WHERE id = ?", [id])

        return NextResponse.json({ success: true, message: "Cliente eliminado exitosamente" })
    } catch (error) {
        console.error("Error deleting client:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
