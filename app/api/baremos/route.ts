import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones

interface Procedure {
  name: string
  code: string // Added 'code' property for consistency with frontend
  price: number // Changed 'cost' to 'price' for consistency
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

    const baremos = rows.map((row: any) => {
      let proceduresParsed: Procedure[] = []
      try {
        // Attempt to parse procedures if it's a string, otherwise use as is or default to empty array
        proceduresParsed = row.procedures ? (typeof row.procedures === 'string' ? JSON.parse(row.procedures) : row.procedures) : []

        // Ensure each procedure object has 'code' and 'price' (from 'cost' if it was named that)
        proceduresParsed = proceduresParsed.map((proc: any) => ({
          name: proc.name || 'Sin nombre',
          code: proc.code || (proc.id ? String(proc.id) : 'N/A'), // Fallback for code if not present, maybe use an ID if available
          price: proc.price ?? proc.cost ?? 0, // Prioritize 'price', then 'cost', then 0
          isActive: proc.isActive ?? true, // Default to true if not specified
          type: proc.type || 'CONSULTA', // Default type
        }));

      } catch (e) {
        console.error("Error parsing procedures JSON for baremo:", row.id, e)
        proceduresParsed = [] // Fallback to empty array on parse error
      }

      return {
        ...row,
        procedures: proceduresParsed,
        effectiveDate: row.effectiveDate ? new Date(row.effectiveDate).toISOString().split("T")[0] : null,
      }
    })

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

    // Ensure procedures are correctly formatted before saving
    const formattedProcedures = procedures.map((proc: any) => ({
      name: proc.name || 'Sin nombre',
      code: proc.code || (proc.id ? String(proc.id) : uuidv4()), // Generate a code if missing, or use existing id
      price: proc.price ?? proc.cost ?? 0,
      isActive: proc.isActive ?? true,
      type: proc.type || 'CONSULTA',
    }));

    const newBaremo: Baremo = {
      id: uuidv4(),
      name,
      clinicName,
      effectiveDate,
      procedures: formattedProcedures, // Use the formatted procedures
    }

    await pool.execute("INSERT INTO baremos (id, name, clinicName, effectiveDate, procedures) VALUES (?, ?, ?, ?, ?)", [
      newBaremo.id,
      newBaremo.name,
      newBaremo.clinicName,
      newBaremo.effectiveDate,
      JSON.stringify(newBaremo.procedures), // Store as JSON string
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
          // Ensure procedures are correctly formatted before saving
          const formattedProcedures = updates[key].map((proc: any) => ({
            name: proc.name || 'Sin nombre',
            code: proc.code || (proc.id ? String(proc.id) : uuidv4()), // Generate a code if missing
            price: proc.price ?? proc.cost ?? 0,
            isActive: proc.isActive ?? true,
            type: proc.type || 'CONSULTA',
          }));
          updateFields.push(`${key} = ?`)
          values.push(JSON.stringify(formattedProcedures)) // Stringify JSON field
        } else {
          updateFields.push(`${key} = ?`)
          values.push(updates[key])
        }
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    values.push(id)
    const [result]: any = await pool.execute(`UPDATE baremos SET ${updateFields.join(", ")} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Baremo no encontrado" }, { status: 404 })
    }

    // Fetch the updated baremo to return
    const [updatedBaremoRows]: any = await pool.execute("SELECT * FROM baremos WHERE id = ?", [id])

    let proceduresParsed: Procedure[] = [];
    try {
      proceduresParsed = updatedBaremoRows[0].procedures ? (typeof updatedBaremoRows[0].procedures === 'string' ? JSON.parse(updatedBaremoRows[0].procedures) : updatedBaremoRows[0].procedures) : [];
      proceduresParsed = proceduresParsed.map((proc: any) => ({
        name: proc.name || 'Sin nombre',
        code: proc.code || (proc.id ? String(proc.id) : 'N/A'),
        price: proc.price ?? proc.cost ?? 0,
        isActive: proc.isActive ?? true,
        type: proc.type || 'CONSULTA',
      }));
    } catch (e) {
      console.error("Error parsing updated baremo procedures JSON:", updatedBaremoRows[0].id, e);
      proceduresParsed = [];
    }

    const updatedBaremo = {
      ...updatedBaremoRows[0],
      procedures: proceduresParsed,
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
    return NextResponse.json({ error: "Failed to delete baremos" }, { status: 500 })
  }
}