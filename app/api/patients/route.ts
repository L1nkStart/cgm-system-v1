import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const ci = searchParams.get("ci")
        const id = searchParams.get("id")

        let query = "SELECT * FROM patients WHERE 1=1"
        const params: any[] = []

        if (ci) {
            query += " AND ci = ?"
            params.push(ci)
        }

        if (id) {
            query += " AND id = ?"
            params.push(id)
        }

        query += " ORDER BY name ASC"

        const [rows]: any = await pool.execute(query, params)

        if (ci && rows.length > 0) {
            // Return single patient for CI lookup
            return NextResponse.json(rows[0])
        }

        if (id && rows.length > 0) {
            // Return single patient for ID lookup
            return NextResponse.json(rows[0])
        }

        if (ci && rows.length === 0) {
            // Patient not found for CI lookup
            return NextResponse.json({ error: "Patient not found" }, { status: 404 })
        }

        // Return all patients
        return NextResponse.json(rows)
    } catch (error) {
        console.error("Error fetching patients:", error)
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const {
            ci,
            name,
            phone,
            otherPhone,
            fixedPhone,
            birthDate,
            age,
            gender,
            address,
            city,
            state,
            email,
            emergencyContact,
            emergencyPhone,
            bloodType,
            allergies,
            medicalHistory,
            isActive = true,
        } = await req.json()

        if (!ci || !name || !phone) {
            return NextResponse.json({ error: "Missing required fields: ci, name, phone" }, { status: 400 })
        }

        // Check if patient with this CI already exists
        const [existingRows]: any = await pool.execute("SELECT id FROM patients WHERE ci = ?", [ci])
        if (existingRows.length > 0) {
            return NextResponse.json({ error: "Ya existe un paciente con esta cédula" }, { status: 400 })
        }

        const patientId = uuidv4()

        await pool.execute(
            `INSERT INTO patients (
        id, ci, name, phone, otherPhone, fixedPhone, birthDate, age, gender,
        address, city, state, email, emergencyContact, emergencyPhone,
        bloodType, allergies, medicalHistory, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId,
                ci,
                name,
                phone,
                otherPhone || null,
                fixedPhone || null,
                birthDate || null,
                age || null,
                gender || null,
                address || null,
                city || null,
                state || null,
                email || null,
                emergencyContact || null,
                emergencyPhone || null,
                bloodType || null,
                allergies || null,
                medicalHistory || null,
                isActive,
            ],
        )

        // Fetch the created patient
        const [newPatientRows]: any = await pool.execute("SELECT * FROM patients WHERE id = ?", [patientId])

        return NextResponse.json(newPatientRows[0], { status: 201 })
    } catch (error) {
        console.error("Error creating patient:", error)
        return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
        }

        const updates = await req.json()

        // Check if patient exists
        const [existingRows]: any = await pool.execute("SELECT id FROM patients WHERE id = ?", [id])
        if (existingRows.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 })
        }

        // If CI is being updated, check for duplicates
        if (updates.ci) {
            const [duplicateRows]: any = await pool.execute("SELECT id FROM patients WHERE ci = ? AND id != ?", [
                updates.ci,
                id,
            ])
            if (duplicateRows.length > 0) {
                return NextResponse.json({ error: "Ya existe un paciente con esta cédula" }, { status: 400 })
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
        await pool.execute(`UPDATE patients SET ${updateFields.join(", ")} WHERE id = ?`, values)

        // Fetch updated patient
        const [updatedRows]: any = await pool.execute("SELECT * FROM patients WHERE id = ?", [id])

        return NextResponse.json(updatedRows[0])
    } catch (error) {
        console.error("Error updating patient:", error)
        return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession()
        if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
        }

        // Check if patient has associated cases
        const [caseRows]: any = await pool.execute("SELECT COUNT(*) AS count FROM cases WHERE patientId = ?", [id])
        if (caseRows[0].count > 0) {
            return NextResponse.json(
                { error: "No se puede eliminar el paciente porque tiene casos asociados" },
                { status: 400 },
            )
        }

        await pool.execute("DELETE FROM patients WHERE id = ?", [id])

        return NextResponse.json({ message: "Patient deleted successfully" })
    } catch (error) {
        console.error("Error deleting patient:", error)
        return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
    }
}
