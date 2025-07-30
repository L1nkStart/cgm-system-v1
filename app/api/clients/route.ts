import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"

interface Client {
    id: string
    name: string
    rif: string
    insuranceCompany?: string
    insuranceCompanyId?: string
    baremoId?: string
    baremoName?: string
    baremoClinicName?: string
    insuranceCompanyName?: string
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search")

        let query = `
      SELECT c.*, 
             b.name as baremoName, 
             b.clinicName as baremoClinicName,
             ic.name as insuranceCompanyName
      FROM clients c
      LEFT JOIN baremos b ON c.baremoId = b.id
      LEFT JOIN insurance_companies ic ON c.insuranceCompanyId = ic.id
    `
        const params: any[] = []

        if (search) {
            query += " WHERE (c.name LIKE ? OR c.rif LIKE ? OR ic.name LIKE ?)"
            const searchTerm = `%${search}%`
            params.push(searchTerm, searchTerm, searchTerm)
        }

        query += " ORDER BY c.name ASC"

        const [rows]: any = await pool.execute(query, params)

        const clients = rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            rif: row.rif,
            insuranceCompany: row.insuranceCompany,
            insuranceCompanyId: row.insuranceCompanyId,
            insuranceCompanyName: row.insuranceCompanyName,
            baremoId: row.baremoId,
            baremoName: row.baremoName,
            baremoClinicName: row.baremoClinicName,
        }))

        return NextResponse.json(clients)
    } catch (error) {
        console.error("Error fetching clients:", error)
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { name, rif, insuranceCompanyId, baremoId } = await req.json()

        if (!name || !rif) {
            return NextResponse.json({ error: "Name and RIF are required" }, { status: 400 })
        }

        // Check if client with this RIF already exists
        const [existingClient]: any = await pool.execute("SELECT id FROM clients WHERE rif = ?", [rif])

        if (existingClient.length > 0) {
            return NextResponse.json({ error: "Ya existe un cliente con este RIF" }, { status: 400 })
        }

        // Validate insurance company exists if provided
        if (insuranceCompanyId) {
            const [insuranceCompany]: any = await pool.execute(
                "SELECT id FROM insurance_companies WHERE id = ? AND isActive = TRUE",
                [insuranceCompanyId],
            )

            if (insuranceCompany.length === 0) {
                return NextResponse.json({ error: "Compañía de seguros no válida" }, { status: 400 })
            }
        }

        // Validate baremo exists if provided
        if (baremoId) {
            const [baremo]: any = await pool.execute("SELECT id FROM baremos WHERE id = ?", [baremoId])

            if (baremo.length === 0) {
                return NextResponse.json({ error: "Baremo no válido" }, { status: 400 })
            }
        }

        const newClient: Client = {
            id: uuidv4(),
            name,
            rif,
            insuranceCompanyId: insuranceCompanyId || null,
            baremoId: baremoId || null,
        }

        await pool.execute("INSERT INTO clients (id, name, rif, insuranceCompanyId, baremoId) VALUES (?, ?, ?, ?, ?)", [
            newClient.id,
            newClient.name,
            newClient.rif,
            newClient.insuranceCompanyId,
            newClient.baremoId,
        ])

        // Fetch the created client with related data
        const [createdClient]: any = await pool.execute(
            `
      SELECT c.*, 
             b.name as baremoName, 
             b.clinicName as baremoClinicName,
             ic.name as insuranceCompanyName
      FROM clients c
      LEFT JOIN baremos b ON c.baremoId = b.id
      LEFT JOIN insurance_companies ic ON c.insuranceCompanyId = ic.id
      WHERE c.id = ?
    `,
            [newClient.id],
        )

        const clientWithDetails = {
            ...createdClient[0],
            baremoName: createdClient[0].baremoName,
            baremoClinicName: createdClient[0].baremoClinicName,
            insuranceCompanyName: createdClient[0].insuranceCompanyName,
        }

        return NextResponse.json(clientWithDetails, { status: 201 })
    } catch (error) {
        console.error("Error creating client:", error)
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const updates = await req.json()

        if (!id) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
        }

        // Check if trying to update RIF to an existing one
        if (updates.rif) {
            const [existingClient]: any = await pool.execute("SELECT id FROM clients WHERE rif = ? AND id != ?", [
                updates.rif,
                id,
            ])

            if (existingClient.length > 0) {
                return NextResponse.json({ error: "Ya existe otro cliente con este RIF" }, { status: 400 })
            }
        }

        // Validate insurance company exists if provided
        if (updates.insuranceCompanyId) {
            const [insuranceCompany]: any = await pool.execute(
                "SELECT id FROM insurance_companies WHERE id = ? AND isActive = TRUE",
                [updates.insuranceCompanyId],
            )

            if (insuranceCompany.length === 0) {
                return NextResponse.json({ error: "Compañía de seguros no válida" }, { status: 400 })
            }
        }

        // Validate baremo exists if provided
        if (updates.baremoId) {
            const [baremo]: any = await pool.execute("SELECT id FROM baremos WHERE id = ?", [updates.baremoId])

            if (baremo.length === 0) {
                return NextResponse.json({ error: "Baremo no válido" }, { status: 400 })
            }
        }

        const updateFields: string[] = []
        const values: any[] = []

        for (const key in updates) {
            if (updates.hasOwnProperty(key) && key !== "id") {
                updateFields.push(`${key} = ?`)
                values.push(updates[key])
            }
        }

        if (updateFields.length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 })
        }

        values.push(id)
        const [result]: any = await pool.execute(`UPDATE clients SET ${updateFields.join(", ")} WHERE id = ?`, values)

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        // Fetch the updated client with related data
        const [updatedClient]: any = await pool.execute(
            `
      SELECT c.*, 
             b.name as baremoName, 
             b.clinicName as baremoClinicName,
             ic.name as insuranceCompanyName
      FROM clients c
      LEFT JOIN baremos b ON c.baremoId = b.id
      LEFT JOIN insurance_companies ic ON c.insuranceCompanyId = ic.id
      WHERE c.id = ?
    `,
            [id],
        )

        const clientWithDetails = {
            ...updatedClient[0],
            baremoName: updatedClient[0].baremoName,
            baremoClinicName: updatedClient[0].baremoClinicName,
            insuranceCompanyName: updatedClient[0].insuranceCompanyName,
        }

        return NextResponse.json(clientWithDetails)
    } catch (error) {
        console.error("Error updating client:", error)
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
        }

        // Check if client has associated cases
        const [casesCount]: any = await pool.execute(
            "SELECT COUNT(*) AS count FROM cases WHERE client = (SELECT name FROM clients WHERE id = ?)",
            [id],
        )

        if (casesCount[0].count > 0) {
            return NextResponse.json({ error: "No se puede eliminar el cliente: tiene casos asociados." }, { status: 400 })
        }

        const [result]: any = await pool.execute("DELETE FROM clients WHERE id = ?", [id])

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error deleting client:", error)
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
}
