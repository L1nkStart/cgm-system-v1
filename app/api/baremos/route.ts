import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones

interface Procedure {
  name: string
  cost: number
  isActive: boolean
  type: string
}

interface Baremo {
  id: string
  name: string
  clinicName: string
  effectiveDate: string
  procedures: Procedure[]
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const clientName = searchParams.get("clientName")

    let query = "SELECT * FROM baremos WHERE 1=1"
    const params: any[] = []

    if (id) {
      query += " AND id = ?"
      params.push(id)
    }
    if (clientName) {
      query += " AND clinicName = ?"
      params.push(clientName)
    }

    const [rows]: any = await pool.execute(query, params)

    // Parse JSON fields and ensure correct types
    const baremos = rows.map((row: any) => ({
      ...row,
      procedures: row.procedures ? JSON.parse(row.procedures) : [],
      effectiveDate: row.effectiveDate ? new Date(row.effectiveDate).toISOString().split("T")[0] : null,
    }))

    if (id) {
      if (baremos.length > 0) {
        return NextResponse.json(baremos[0])
      }
      return NextResponse.json({ error: "Baremo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(baremos)
  } catch (error) {
    console.error("Error fetching baremos:", error)
    return NextResponse.json({ error: "Failed to fetch baremos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, clinicName, effectiveDate, procedures } = await req.json()

    if (!name || !clinicName || !effectiveDate || !procedures || !Array.isArray(procedures)) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const newBaremo: Baremo = {
      id: uuidv4(),
      name,
      clinicName,
      effectiveDate,
      procedures,
    }

    await pool.execute("INSERT INTO baremos (id, name, clinicName, effectiveDate, procedures) VALUES (?, ?, ?, ?, ?)", [
      newBaremo.id,
      newBaremo.name,
      newBaremo.clinicName,
      newBaremo.effectiveDate,
      JSON.stringify(newBaremo.procedures),
    ])

    return NextResponse.json(newBaremo, { status: 201 })
  } catch (error) {
    console.error("Error creating baremo:", error)
    return NextResponse.json({ error: "Failed to create baremo" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const updates = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID del baremo" }, { status: 400 })
    }

    const updateFields: string[] = []
    const values: any[] = []

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "procedures") {
          updateFields.push(`${key} = ?`)
          values.push(JSON.stringify(updates[key])) // Stringify JSON field
        } else {
          updateFields.push(`${key} = ?`)
          values.push(updates[key])
        }
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const [result]: any = await pool.execute(`UPDATE baremos SET ${updateFields.join(", ")} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Baremo no encontrado" }, { status: 404 })
    }

    // Fetch the updated baremo to return
    const [updatedBaremoRows]: any = await pool.execute("SELECT * FROM baremos WHERE id = ?", [id])
    const updatedBaremo = {
      ...updatedBaremoRows[0],
      procedures: updatedBaremoRows[0].procedures ? JSON.parse(updatedBaremoRows[0].procedures) : [],
      effectiveDate: updatedBaremoRows[0].effectiveDate
        ? new Date(updatedBaremoRows[0].effectiveDate).toISOString().split("T")[0]
        : null,
    }
    return NextResponse.json(updatedBaremo)
  } catch (error) {
    console.error("Error updating baremo:", error)
    return NextResponse.json({ error: "Failed to update baremo" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID del baremo" }, { status: 400 })
    }

    const [result]: any = await pool.execute("DELETE FROM baremos WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Baremo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Baremo eliminado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting baremo:", error)
    return NextResponse.json({ error: "Failed to delete baremo" }, { status: 500 })
  }
}
