import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

export async function GET(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const holderId = searchParams.get("holderId")
        const patientId = searchParams.get("patientId")

        let query = `
      SELECT hpr.*, 
             ih.name as holderName, ih.ci as holderCI, ih.policyNumber,
             p.name as patientName, p.ci as patientCI
      FROM holder_patient_relationships hpr
      INNER JOIN insurance_holders ih ON hpr.holderId = ih.id
      INNER JOIN patients p ON hpr.patientId = p.id
      WHERE hpr.isActive = TRUE
    `
        const params: any[] = []

        if (holderId) {
            query += " AND hpr.holderId = ?"
            params.push(holderId)
        }

        if (patientId) {
            query += " AND hpr.patientId = ?"
            params.push(patientId)
        }

        query += " ORDER BY hpr.isPrimary DESC, ih.name ASC"

        const [rows]: any = await pool.execute(query, params)

        const relationships = rows.map((row: any) => ({
            ...row,
            isPrimary: Boolean(row.isPrimary),
            isActive: Boolean(row.isActive),
        }))

        return NextResponse.json(relationships)
    } catch (error) {
        console.error("Error fetching holder-patient relationships:", error)
        return NextResponse.json({ error: "Failed to fetch relationships" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { holderId, patientId, relationshipType, isPrimary = false } = await req.json()

        if (!holderId || !patientId || !relationshipType) {
            return NextResponse.json(
                { error: "Missing required fields: holderId, patientId, relationshipType" },
                { status: 400 },
            )
        }

        // Check if relationship already exists
        const [existingRelationship]: any = await pool.execute(
            "SELECT id FROM holder_patient_relationships WHERE holderId = ? AND patientId = ? AND isActive = TRUE",
            [holderId, patientId],
        )

        if (existingRelationship.length > 0) {
            return NextResponse.json(
                { error: "Ya existe una relación activa entre este titular y paciente" },
                { status: 400 },
            )
        }

        const relationshipId = uuidv4()

        // Start transaction
        const connection = await pool.getConnection()
        await connection.beginTransaction()

        try {
            // If this is set as primary, remove primary status from other relationships for this patient
            if (isPrimary) {
                await connection.execute(
                    "UPDATE holder_patient_relationships SET isPrimary = FALSE WHERE patientId = ? AND isActive = TRUE",
                    [patientId],
                )

                // Update patient's primary holder reference
                await connection.execute("UPDATE patients SET primaryInsuranceHolderId = ? WHERE id = ?", [holderId, patientId])
            }

            // Create new relationship
            await connection.execute(
                `INSERT INTO holder_patient_relationships (
          id, holderId, patientId, relationshipType, isPrimary, isActive
        ) VALUES (?, ?, ?, ?, ?, ?)`,
                [relationshipId, holderId, patientId, relationshipType, isPrimary, true],
            )

            await connection.commit()
            connection.release()

            // Fetch the created relationship with details
            const [newRelationship]: any = await pool.execute(
                `
        SELECT hpr.*, 
               ih.name as holderName, ih.ci as holderCI, ih.policyNumber,
               p.name as patientName, p.ci as patientCI
        FROM holder_patient_relationships hpr
        INNER JOIN insurance_holders ih ON hpr.holderId = ih.id
        INNER JOIN patients p ON hpr.patientId = p.id
        WHERE hpr.id = ?
      `,
                [relationshipId],
            )

            const relationship = {
                ...newRelationship[0],
                isPrimary: Boolean(newRelationship[0].isPrimary),
                isActive: Boolean(newRelationship[0].isActive),
            }

            return NextResponse.json(relationship, { status: 201 })
        } catch (error) {
            await connection.rollback()
            connection.release()
            throw error
        }
    } catch (error) {
        console.error("Error creating holder-patient relationship:", error)
        return NextResponse.json({ error: "Failed to create relationship" }, { status: 500 })
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
            return NextResponse.json({ error: "Relationship ID is required" }, { status: 400 })
        }

        // Get current relationship data
        const [currentRelationship]: any = await pool.execute("SELECT * FROM holder_patient_relationships WHERE id = ?", [
            id,
        ])

        if (currentRelationship.length === 0) {
            return NextResponse.json({ error: "Relationship not found" }, { status: 404 })
        }

        const relationship = currentRelationship[0]

        // Start transaction
        const connection = await pool.getConnection()
        await connection.beginTransaction()

        try {
            // If setting as primary, remove primary status from other relationships for this patient
            if (updates.isPrimary === true) {
                await connection.execute(
                    "UPDATE holder_patient_relationships SET isPrimary = FALSE WHERE patientId = ? AND isActive = TRUE AND id != ?",
                    [relationship.patientId, id],
                )

                // Update patient's primary holder reference
                await connection.execute("UPDATE patients SET primaryInsuranceHolderId = ? WHERE id = ?", [
                    relationship.holderId,
                    relationship.patientId,
                ])
            }

            // Update the relationship
            const updateFields: string[] = []
            const values: any[] = []

            for (const key in updates) {
                if (updates.hasOwnProperty(key) && key !== "id") {
                    updateFields.push(`${key} = ?`)
                    values.push(updates[key])
                }
            }

            if (updateFields.length > 0) {
                values.push(id)
                await connection.execute(
                    `UPDATE holder_patient_relationships SET ${updateFields.join(", ")} WHERE id = ?`,
                    values,
                )
            }

            await connection.commit()
            connection.release()

            // Fetch updated relationship
            const [updatedRelationship]: any = await pool.execute(
                `
        SELECT hpr.*, 
               ih.name as holderName, ih.ci as holderCI, ih.policyNumber,
               p.name as patientName, p.ci as patientCI
        FROM holder_patient_relationships hpr
        INNER JOIN insurance_holders ih ON hpr.holderId = ih.id
        INNER JOIN patients p ON hpr.patientId = p.id
        WHERE hpr.id = ?
      `,
                [id],
            )

            const result = {
                ...updatedRelationship[0],
                isPrimary: Boolean(updatedRelationship[0].isPrimary),
                isActive: Boolean(updatedRelationship[0].isActive),
            }

            return NextResponse.json(result)
        } catch (error) {
            await connection.rollback()
            connection.release()
            throw error
        }
    } catch (error) {
        console.error("Error updating holder-patient relationship:", error)
        return NextResponse.json({ error: "Failed to update relationship" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Relationship ID is required" }, { status: 400 })
        }

        // Get relationship data before deletion
        const [relationship]: any = await pool.execute("SELECT * FROM holder_patient_relationships WHERE id = ?", [id])

        if (relationship.length === 0) {
            return NextResponse.json({ error: "Relationship not found" }, { status: 404 })
        }

        const rel = relationship[0]

        // Start transaction
        const connection = await pool.getConnection()
        await connection.beginTransaction()

        try {
            // Delete the relationship
            await connection.execute("DELETE FROM holder_patient_relationships WHERE id = ?", [id])

            // If this was the primary relationship, set another one as primary if available
            if (rel.isPrimary) {
                const [otherRelationships]: any = await connection.execute(
                    "SELECT id, holderId FROM holder_patient_relationships WHERE patientId = ? AND isActive = TRUE ORDER BY created_at ASC LIMIT 1",
                    [rel.patientId],
                )

                if (otherRelationships.length > 0) {
                    const newPrimary = otherRelationships[0]
                    await connection.execute("UPDATE holder_patient_relationships SET isPrimary = TRUE WHERE id = ?", [
                        newPrimary.id,
                    ])
                    await connection.execute("UPDATE patients SET primaryInsuranceHolderId = ? WHERE id = ?", [
                        newPrimary.holderId,
                        rel.patientId,
                    ])
                } else {
                    // No other relationships, clear primary holder from patient
                    await connection.execute("UPDATE patients SET primaryInsuranceHolderId = NULL WHERE id = ?", [rel.patientId])
                }
            }

            await connection.commit()
            connection.release()

            return NextResponse.json({ message: "Relationship deleted successfully" }, { status: 200 })
        } catch (error) {
            await connection.rollback()
            connection.release()
            throw error
        }
    } catch (error) {
        console.error("Error deleting holder-patient relationship:", error)
        return NextResponse.json({ error: "Failed to delete relationship" }, { status: 500 })
    }
}
