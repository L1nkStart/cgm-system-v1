import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has permission (Superusuario or Jefe Financiero)
        if (session.role !== "Superusuario" && session.role !== "Jefe Financiero") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const [rows]: any = await pool.execute("SELECT * FROM insurance_companies WHERE id = ?", [params.id])

        if (rows.length === 0) {
            return NextResponse.json({ error: "Insurance company not found" }, { status: 404 })
        }

        const company = {
            ...rows[0],
            isActive: Boolean(rows[0].isActive),
        }

        return NextResponse.json(company)
    } catch (error) {
        console.error("Error fetching insurance company:", error)
        return NextResponse.json({ error: "Failed to fetch insurance company" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has permission (Superusuario or Jefe Financiero)
        if (session.role !== "Superusuario" && session.role !== "Jefe Financiero") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updates = await req.json()

        // Check if trying to update RIF to an existing one
        if (updates.rif) {
            const [existingCompany]: any = await pool.execute(
                "SELECT id FROM insurance_companies WHERE rif = ? AND id != ?",
                [updates.rif, params.id],
            )

            if (existingCompany.length > 0) {
                return NextResponse.json({ error: "Ya existe otra compañía con este RIF" }, { status: 400 })
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

        values.push(params.id)
        const [result]: any = await pool.execute(
            `UPDATE insurance_companies SET ${updateFields.join(", ")} WHERE id = ?`,
            values,
        )

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance company not found" }, { status: 404 })
        }

        // Fetch the updated company
        const [updatedRows]: any = await pool.execute("SELECT * FROM insurance_companies WHERE id = ?", [params.id])
        const updatedCompany = {
            ...updatedRows[0],
            isActive: Boolean(updatedRows[0].isActive),
        }

        return NextResponse.json(updatedCompany)
    } catch (error) {
        console.error("Error updating insurance company:", error)
        return NextResponse.json({ error: "Failed to update insurance company" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Only Superusuario can delete
        if (session.role !== "Superusuario") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Check if company has associated clients
        const [clientsCount]: any = await pool.execute(
            "SELECT COUNT(*) AS count FROM clients WHERE insuranceCompanyId = ?",
            [params.id],
        )

        if (clientsCount[0].count > 0) {
            // Instead of deleting, deactivate the company
            await pool.execute("UPDATE insurance_companies SET isActive = FALSE WHERE id = ?", [params.id])
            return NextResponse.json(
                {
                    message: "Compañía desactivada debido a que tiene clientes asociados",
                },
                { status: 200 },
            )
        }

        const [result]: any = await pool.execute("DELETE FROM insurance_companies WHERE id = ?", [params.id])

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance company not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Insurance company deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error deleting insurance company:", error)
        return NextResponse.json({ error: "Failed to delete insurance company" }, { status: 500 })
    }
}
