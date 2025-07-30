import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Solo Superusuario y Jefe Financiero pueden acceder
        if (!["Superusuario", "Jefe Financiero"].includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const includeInactive = searchParams.get("includeInactive") === "true"

        let query = `
      SELECT 
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
    `

        if (!includeInactive) {
            query += " WHERE isActive = TRUE"
        }

        query += " ORDER BY name ASC"

        const [rows] = await pool.execute(query)
        return NextResponse.json(rows)
    } catch (error) {
        console.error("Error fetching insurance companies:", error)
        return NextResponse.json({ error: "Error fetching insurance companies" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Solo Superusuario y Jefe Financiero pueden crear
        if (!["Superusuario", "Jefe Financiero"].includes(session.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const { name, rif, phone, email, address, contactPerson, contactPhone, contactEmail } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const id = `IC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const [result] = await pool.execute(
            `INSERT INTO insurance_companies 
       (id, name, rif, phone, email, address, contactPerson, contactPhone, contactEmail, isActive) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [id, name, rif, phone, email, address, contactPerson, contactPhone, contactEmail],
        )

        return NextResponse.json(
            {
                message: "Insurance company created successfully",
                id,
            },
            { status: 201 },
        )
    } catch (error: any) {
        console.error("Error creating insurance company:", error)

        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ error: "RIF already exists" }, { status: 409 })
        }

        return NextResponse.json({ error: "Error creating insurance company" }, { status: 500 })
    }
}
