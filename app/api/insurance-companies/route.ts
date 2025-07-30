import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

interface InsuranceCompany {
    id: string
    name: string
    rif?: string
    address?: string
    phone?: string
    email?: string
    contactPerson?: string
    contactPhone?: string
    contactEmail?: string
    website?: string
    notes?: string
    isActive: boolean
}

export async function GET(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has permission (Superusuario or Jefe Financiero)
        if (session.role !== "Superusuario" && session.role !== "Jefe Financiero") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search")
        const includeInactive = searchParams.get("includeInactive") === "true"
        const activeOnly = searchParams.get("activeOnly") === "true"

        let query = "SELECT * FROM insurance_companies"
        const params: any[] = []

        const conditions: string[] = []

        if (search) {
            conditions.push("(name LIKE ? OR rif LIKE ? OR email LIKE ?)")
            const searchTerm = `%${search}%`
            params.push(searchTerm, searchTerm, searchTerm)
        }

        if (activeOnly || !includeInactive) {
            conditions.push("isActive = TRUE")
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ")
        }

        query += " ORDER BY name ASC"

        const [rows]: any = await pool.execute(query, params)

        const companies = rows.map((row: any) => ({
            ...row,
            isActive: Boolean(row.isActive),
        }))

        return NextResponse.json(companies)
    } catch (error) {
        console.error("Error fetching insurance companies:", error)
        return NextResponse.json({ error: "Failed to fetch insurance companies" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has permission (Superusuario or Jefe Financiero)
        if (session.role !== "Superusuario" && session.role !== "Jefe Financiero") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { name, rif, address, phone, email, contactPerson, contactPhone, contactEmail, website, notes } =
            await req.json()

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        // Check if RIF already exists (if provided)
        if (rif) {
            const [existingCompany]: any = await pool.execute("SELECT id FROM insurance_companies WHERE rif = ?", [rif])
            if (existingCompany.length > 0) {
                return NextResponse.json({ error: "Ya existe una compañía con este RIF" }, { status: 400 })
            }
        }

        const newCompany: InsuranceCompany = {
            id: uuidv4(),
            name,
            rif: rif || null,
            address: address || null,
            phone: phone || null,
            email: email || null,
            contactPerson: contactPerson || null,
            contactPhone: contactPhone || null,
            contactEmail: contactEmail || null,
            website: website || null,
            notes: notes || null,
            isActive: true,
        }

        await pool.execute(
            `INSERT INTO insurance_companies (
        id, name, rif, address, phone, email, contactPerson, 
        contactPhone, contactEmail, website, notes, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newCompany.id,
                newCompany.name,
                newCompany.rif,
                newCompany.address,
                newCompany.phone,
                newCompany.email,
                newCompany.contactPerson,
                newCompany.contactPhone,
                newCompany.contactEmail,
                newCompany.website,
                newCompany.notes,
                newCompany.isActive,
            ],
        )

        return NextResponse.json(newCompany, { status: 201 })
    } catch (error) {
        console.error("Error creating insurance company:", error)
        return NextResponse.json({ error: "Failed to create insurance company" }, { status: 500 })
    }
}
