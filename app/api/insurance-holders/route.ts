import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

interface InsuranceHolder {
    id: string
    ci: string
    name: string
    phone: string
    otherPhone?: string
    fixedPhone?: string
    email?: string
    birthDate?: string
    age?: number
    gender?: string
    address?: string
    city?: string
    state?: string
    clientId?: string
    policyNumber?: string
    policyType?: string
    policyStatus?: string
    policyStartDate?: string
    policyEndDate?: string
    coverageType?: string
    maxCoverageAmount?: number
    usedCoverageAmount?: number
    emergencyContact?: string
    emergencyPhone?: string
    bloodType?: string
    allergies?: string
    medicalHistory?: string
    isActive?: boolean
}

export async function GET(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const ci = searchParams.get("ci")
        const search = searchParams.get("search")
        const policyNumber = searchParams.get("policyNumber")
        const includePatients = searchParams.get("includePatients") === "true"

        let query = `
      SELECT ih.*, 
             c.name as clientName,
             c.insuranceCompany,
             COUNT(CASE WHEN cases.id IS NOT NULL THEN 1 END) as totalCases,
             COUNT(CASE WHEN hpr.id IS NOT NULL THEN 1 END) as totalPatients
      FROM insurance_holders ih
      LEFT JOIN clients c ON ih.clientId = c.id
      LEFT JOIN cases ON ih.id = cases.insuranceHolderId
      LEFT JOIN holder_patient_relationships hpr ON ih.id = hpr.holderId AND hpr.isActive = TRUE
      WHERE ih.isActive = TRUE
    `
        const params: any[] = []

        if (id) {
            query += " AND ih.id = ?"
            params.push(id)
        } else if (ci) {
            query += " AND ih.ci = ?"
            params.push(ci)
        } else if (policyNumber) {
            query += " AND ih.policyNumber = ?"
            params.push(policyNumber)
        } else if (search) {
            query +=
                " AND (ih.name LIKE ? OR ih.ci LIKE ? OR ih.phone LIKE ? OR ih.email LIKE ? OR ih.policyNumber LIKE ? OR c.name LIKE ?)"
            const searchTerm = `%${search}%`
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
        }

        query += " GROUP BY ih.id ORDER BY ih.name ASC"

        const [rows]: any = await pool.execute(query, params)

        const holders = rows.map((row: any) => ({
            ...row,
            birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split("T")[0] : null,
            policyStartDate: row.policyStartDate ? new Date(row.policyStartDate).toISOString().split("T")[0] : null,
            policyEndDate: row.policyEndDate ? new Date(row.policyEndDate).toISOString().split("T")[0] : null,
            isActive: Boolean(row.isActive),
            maxCoverageAmount: row.maxCoverageAmount ? Number(row.maxCoverageAmount) : null,
            usedCoverageAmount: row.usedCoverageAmount ? Number(row.usedCoverageAmount) : 0,
            totalCases: Number(row.totalCases),
            totalPatients: Number(row.totalPatients),
        }))

        // If including patients, fetch related patients for each holder
        if (includePatients && holders.length > 0) {
            for (const holder of holders) {
                const [patientRows]: any = await pool.execute(
                    `
          SELECT p.*, hpr.relationshipType, hpr.isPrimary
          FROM patients p
          INNER JOIN holder_patient_relationships hpr ON p.id = hpr.patientId
          WHERE hpr.holderId = ? AND hpr.isActive = TRUE
          ORDER BY hpr.isPrimary DESC, p.name ASC
        `,
                    [holder.id],
                )

                holder.patients = patientRows.map((row: any) => ({
                    ...row,
                    birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split("T")[0] : null,
                    isActive: Boolean(row.isActive),
                    relationshipType: row.relationshipType,
                    isPrimary: Boolean(row.isPrimary),
                }))
            }
        }

        if (id || ci || policyNumber) {
            if (holders.length > 0) {
                return NextResponse.json(holders[0])
            }
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 })
        }

        return NextResponse.json(holders)
    } catch (error) {
        console.error("Error fetching insurance holders:", error)
        return NextResponse.json({ error: "Failed to fetch insurance holders" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const {
            ci,
            name,
            phone,
            otherPhone,
            fixedPhone,
            email,
            birthDate,
            age,
            gender,
            address,
            city,
            state,
            clientId, // Now required - the selected client/insurance company
            policyNumber,
            policyType,
            policyStatus,
            policyStartDate,
            policyEndDate,
            coverageType,
            maxCoverageAmount,
            emergencyContact,
            emergencyPhone,
            bloodType,
            allergies,
            medicalHistory,
            createAsPatient = true,
        } = await req.json()

        if (!ci || !name || !phone || !clientId) {
            return NextResponse.json({ error: "Missing required fields: ci, name, phone, clientId" }, { status: 400 })
        }

        // Check if holder with this CI already exists
        const [existingHolder]: any = await pool.execute("SELECT id FROM insurance_holders WHERE ci = ?", [ci])
        if (existingHolder.length > 0) {
            return NextResponse.json({ error: "Ya existe un titular con esta cédula" }, { status: 400 })
        }

        // Verify that the client exists
        const [clientExists]: any = await pool.execute("SELECT id, name, insuranceCompany FROM clients WHERE id = ?", [
            clientId,
        ])
        if (clientExists.length === 0) {
            return NextResponse.json({ error: "Cliente/Aseguradora no encontrada" }, { status: 400 })
        }

        const newHolder: InsuranceHolder = {
            id: uuidv4(),
            ci,
            name,
            phone,
            otherPhone: otherPhone || null,
            fixedPhone: fixedPhone || null,
            email: email || null,
            birthDate: birthDate || null,
            age: age ? Number(age) : null,
            gender: gender || null,
            address: address || null,
            city: city || null,
            state: state || null,
            clientId,
            policyNumber: policyNumber || null,
            policyType: policyType || "Individual",
            policyStatus: policyStatus || "Activo",
            policyStartDate: policyStartDate || null,
            policyEndDate: policyEndDate || null,
            coverageType: coverageType || null,
            maxCoverageAmount: maxCoverageAmount ? Number(maxCoverageAmount) : null,
            usedCoverageAmount: 0,
            emergencyContact: emergencyContact || null,
            emergencyPhone: emergencyPhone || null,
            bloodType: bloodType || null,
            allergies: allergies || null,
            medicalHistory: medicalHistory || null,
            isActive: true,
        }

        // Start transaction
        const connection = await pool.getConnection()
        await connection.beginTransaction()

        try {
            // Insert insurance holder
            await connection.execute(
                `INSERT INTO insurance_holders (
          id, ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender,
          address, city, state, clientId, policyNumber, policyType, policyStatus,
          policyStartDate, policyEndDate, coverageType, maxCoverageAmount, usedCoverageAmount,
          emergencyContact, emergencyPhone, bloodType, allergies, medicalHistory, isActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newHolder.id,
                    newHolder.ci,
                    newHolder.name,
                    newHolder.phone,
                    newHolder.otherPhone,
                    newHolder.fixedPhone,
                    newHolder.email,
                    newHolder.birthDate,
                    newHolder.age,
                    newHolder.gender,
                    newHolder.address,
                    newHolder.city,
                    newHolder.state,
                    newHolder.clientId,
                    newHolder.policyNumber,
                    newHolder.policyType,
                    newHolder.policyStatus,
                    newHolder.policyStartDate,
                    newHolder.policyEndDate,
                    newHolder.coverageType,
                    newHolder.maxCoverageAmount,
                    newHolder.usedCoverageAmount,
                    newHolder.emergencyContact,
                    newHolder.emergencyPhone,
                    newHolder.bloodType,
                    newHolder.allergies,
                    newHolder.medicalHistory,
                    newHolder.isActive,
                ],
            )

            // If createAsPatient is true, also create as patient and establish relationship
            if (createAsPatient) {
                // Check if patient with this CI already exists
                const [existingPatient]: any = await connection.execute("SELECT id FROM patients WHERE ci = ?", [ci])

                let patientId: string

                if (existingPatient.length > 0) {
                    patientId = existingPatient[0].id
                    // Update patient to reference this holder as primary
                    await connection.execute("UPDATE patients SET primaryInsuranceHolderId = ? WHERE id = ?", [
                        newHolder.id,
                        patientId,
                    ])
                } else {
                    // Create new patient
                    patientId = uuidv4()
                    await connection.execute(
                        `INSERT INTO patients (
              id, ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender,
              address, city, state, emergencyContact, emergencyPhone, bloodType, allergies,
              medicalHistory, primaryInsuranceHolderId, isActive
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            patientId,
                            newHolder.ci,
                            newHolder.name,
                            newHolder.phone,
                            newHolder.otherPhone,
                            newHolder.fixedPhone,
                            newHolder.email,
                            newHolder.birthDate,
                            newHolder.age,
                            newHolder.gender,
                            newHolder.address,
                            newHolder.city,
                            newHolder.state,
                            newHolder.emergencyContact,
                            newHolder.emergencyPhone,
                            newHolder.bloodType,
                            newHolder.allergies,
                            newHolder.medicalHistory,
                            newHolder.id,
                            true,
                        ],
                    )
                }

                // Create holder-patient relationship
                const relationshipId = uuidv4()
                await connection.execute(
                    `INSERT INTO holder_patient_relationships (
            id, holderId, patientId, relationshipType, isPrimary, isActive
          ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [relationshipId, newHolder.id, patientId, "Titular", true, true],
                )
            }

            await connection.commit()
            connection.release()

            // Return the holder with client information
            const holderWithClient = {
                ...newHolder,
                clientName: clientExists[0].name,
                insuranceCompany: clientExists[0].insuranceCompany,
            }

            return NextResponse.json(holderWithClient, { status: 201 })
        } catch (error) {
            await connection.rollback()
            connection.release()
            throw error
        }
    } catch (error) {
        console.error("Error creating insurance holder:", error)
        return NextResponse.json({ error: "Failed to create insurance holder" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")
        const updates = await req.json()

        if (!id) {
            return NextResponse.json({ error: "Insurance holder ID is required" }, { status: 400 })
        }

        // Check if trying to update CI to an existing one
        if (updates.ci) {
            const [existingHolder]: any = await pool.execute("SELECT id FROM insurance_holders WHERE ci = ? AND id != ?", [
                updates.ci,
                id,
            ])
            if (existingHolder.length > 0) {
                return NextResponse.json({ error: "Ya existe otro titular con esta cédula" }, { status: 400 })
            }
        }

        // If updating clientId, verify it exists
        if (updates.clientId) {
            const [clientExists]: any = await pool.execute("SELECT id FROM clients WHERE id = ?", [updates.clientId])
            if (clientExists.length === 0) {
                return NextResponse.json({ error: "Cliente/Aseguradora no encontrada" }, { status: 400 })
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
        const [result]: any = await pool.execute(
            `UPDATE insurance_holders SET ${updateFields.join(", ")} WHERE id = ?`,
            values,
        )

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 })
        }

        // Fetch the updated holder with client information
        const [updatedRows]: any = await pool.execute(
            `SELECT ih.*, c.name as clientName, c.insuranceCompany 
       FROM insurance_holders ih 
       LEFT JOIN clients c ON ih.clientId = c.id 
       WHERE ih.id = ?`,
            [id],
        )

        const updatedHolder = {
            ...updatedRows[0],
            birthDate: updatedRows[0].birthDate ? new Date(updatedRows[0].birthDate).toISOString().split("T")[0] : null,
            policyStartDate: updatedRows[0].policyStartDate
                ? new Date(updatedRows[0].policyStartDate).toISOString().split("T")[0]
                : null,
            policyEndDate: updatedRows[0].policyEndDate
                ? new Date(updatedRows[0].policyEndDate).toISOString().split("T")[0]
                : null,
            isActive: Boolean(updatedRows[0].isActive),
            maxCoverageAmount: updatedRows[0].maxCoverageAmount ? Number(updatedRows[0].maxCoverageAmount) : null,
            usedCoverageAmount: updatedRows[0].usedCoverageAmount ? Number(updatedRows[0].usedCoverageAmount) : 0,
        }

        return NextResponse.json(updatedHolder)
    } catch (error) {
        console.error("Error updating insurance holder:", error)
        return NextResponse.json({ error: "Failed to update insurance holder" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session || (session.role !== "Superusuario" && session.role !== "Coordinador Regional")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Insurance holder ID is required" }, { status: 400 })
        }

        // Check if holder has associated cases
        const [casesCount]: any = await pool.execute("SELECT COUNT(*) AS count FROM cases WHERE insuranceHolderId = ?", [
            id,
        ])

        if (casesCount[0].count > 0) {
            return NextResponse.json({ error: "No se puede eliminar el titular: tiene casos asociados." }, { status: 400 })
        }

        const [result]: any = await pool.execute("DELETE FROM insurance_holders WHERE id = ?", [id])

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Insurance holder deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error deleting insurance holder:", error)
        return NextResponse.json({ error: "Failed to delete insurance holder" }, { status: 500 })
    }
}
