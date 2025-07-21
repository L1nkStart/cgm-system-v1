import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones
import { ciTitular } from "@/lib/utils" // Declare the variable before using it

// Define las interfaces para los datos (pueden estar en un archivo de tipos separado)
interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface Case {
  id: string
  client: string
  date: string
  sinisterNo: string
  idNumber: string
  ciTitular: string
  ciPatient: string
  patientName: string
  patientPhone: string
  assignedAnalystId: string
  assignedAnalystName?: string // Para display, no en DB directamente
  status: string
  doctor?: string
  schedule?: string
  consultory?: string
  results?: string
  auditNotes?: string
  clinicCost?: number
  cgmServiceCost?: number
  totalInvoiceAmount?: number
  invoiceGenerated?: boolean
  creatorName?: string
  creatorEmail?: string
  creatorPhone?: string
  patientOtherPhone?: string
  patientFixedPhone?: string
  patientBirthDate?: string
  patientAge?: number
  patientGender?: string
  collective?: string
  diagnosis?: string
  provider?: string
  state?: string
  city?: string
  address?: string
  holderCI?: string
  services?: Service[]
  typeOfRequirement?: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const analystId = searchParams.get("analystId")
    const statusFilter = searchParams.get("status")

    let query =
      "SELECT c.*, u.name AS assignedAnalystName FROM cases c LEFT JOIN users u ON c.assignedAnalystId = u.id WHERE 1=1"
    const params: any[] = []

    if (id) {
      query += " AND c.id = ?"
      params.push(id)
    }
    if (analystId) {
      query += " AND c.assignedAnalystId = ?"
      params.push(analystId)
    }
    if (statusFilter) {
      const statuses = statusFilter.split(",")
      query += ` AND c.status IN (${statuses.map(() => "?").join(",")})`
      params.push(...statuses)
    }

    const [rows]: any = await pool.execute(query, params)

    // Parse JSON fields and ensure correct types
    const cases = rows.map((row: any) => ({
      ...row,
      services: row.services ? JSON.parse(row.services) : [],
      // Convert Date objects to string if needed for consistency with mock
      date: row.date ? new Date(row.date).toISOString().split("T")[0] : null,
      patientBirthDate: row.patientBirthDate ? new Date(row.patientBirthDate).toISOString().split("T")[0] : null,
    }))

    if (id) {
      if (cases.length > 0) {
        return NextResponse.json(cases[0])
      }
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json(cases)
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const {
      client,
      date,
      patientName,
      ciPatient,
      patientPhone,
      assignedAnalystId,
      status,
      creatorName,
      creatorEmail,
      creatorPhone,
      patientOtherPhone,
      patientFixedPhone,
      patientBirthDate,
      patientAge,
      patientGender,
      collective,
      diagnosis,
      provider,
      state,
      city,
      address,
      holderCI,
      services,
      typeOfRequirement,
    } = await req.json()

    if (!client || !date || !patientName || !ciPatient || !patientPhone || !assignedAnalystId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newCase: Case = {
      id: uuidv4(),
      client,
      date,
      sinisterNo: Math.floor(Math.random() * 100000).toString(),
      idNumber: `V-${Math.floor(Math.random() * 10000000).toString()}`,
      ciTitular: ciTitular || `V-${Math.floor(Math.random() * 10000000).toString()}`, // Usar el valor del formulario o generar
      ciPatient,
      patientName,
      patientPhone,
      assignedAnalystId,
      status,
      clinicCost: 0,
      cgmServiceCost: 0,
      totalInvoiceAmount: 0,
      invoiceGenerated: false,
      creatorName: creatorName || "Coordinador Regional", // Mantener default si no se envía
      creatorEmail: creatorEmail || "coord@cgm.com", // Mantener default si no se envía
      creatorPhone: creatorPhone || "0412-9999999", // Mantener default si no se envía
      patientOtherPhone: patientOtherPhone || null, // Usar null si está vacío
      patientFixedPhone: patientFixedPhone || null, // Usar null si está vacío
      patientBirthDate: patientBirthDate || null,
      patientAge: patientAge || null,
      patientGender: patientGender || null,
      collective: collective || null,
      diagnosis: diagnosis || null,
      provider: provider || null,
      state: state || null,
      city: city || null,
      address: address || null,
      holderCI: holderCI || null, // Usar el valor del formulario o null
      services: services || [],
      typeOfRequirement: typeOfRequirement || "CONSULTA",
    }

    await pool.execute(
      `INSERT INTO cases (
        id, client, date, sinisterNo, idNumber, ciTitular, ciPatient, patientName, patientPhone,
        assignedAnalystId, status, doctor, schedule, consultory, results, auditNotes, clinicCost,
        cgmServiceCost, totalInvoiceAmount, invoiceGenerated, creatorName, creatorEmail, creatorPhone,
        patientOtherPhone, patientFixedPhone, patientBirthDate, patientAge, patientGender, collective,
        diagnosis, provider, state, city, address, holderCI, services, typeOfRequirement
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCase.id,
        newCase.client,
        newCase.date,
        newCase.sinisterNo,
        newCase.idNumber,
        newCase.ciTitular,
        newCase.ciPatient,
        newCase.patientName,
        newCase.patientPhone,
        newCase.assignedAnalystId,
        newCase.status,
        newCase.doctor || null,
        newCase.schedule || null,
        newCase.consultory || null,
        newCase.results || null,
        newCase.auditNotes || null,
        newCase.clinicCost,
        newCase.cgmServiceCost,
        newCase.totalInvoiceAmount,
        newCase.invoiceGenerated,
        newCase.creatorName,
        newCase.creatorEmail,
        newCase.creatorPhone,
        newCase.patientOtherPhone,
        newCase.patientFixedPhone,
        newCase.patientBirthDate,
        newCase.patientAge,
        newCase.patientGender,
        newCase.collective,
        newCase.diagnosis,
        newCase.provider,
        newCase.state,
        newCase.city,
        newCase.address,
        newCase.holderCI,
        JSON.stringify(newCase.services),
        newCase.typeOfRequirement,
      ],
    )

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const updates = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    const updateFields: string[] = []
    const values: any[] = []

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "services") {
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
    const [result]: any = await pool.execute(`UPDATE cases SET ${updateFields.join(", ")} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Fetch the updated case to return
    const [updatedCaseRows]: any = await pool.execute("SELECT * FROM cases WHERE id = ?", [id])
    const updatedCase = {
      ...updatedCaseRows[0],
      services: updatedCaseRows[0].services ? JSON.parse(updatedCaseRows[0].services) : [],
      date: updatedCaseRows[0].date ? new Date(updatedCaseRows[0].date).toISOString().split("T")[0] : null,
      patientBirthDate: updatedCaseRows[0].patientBirthDate
        ? new Date(updatedCaseRows[0].patientBirthDate).toISOString().split("T")[0]
        : null,
    }
    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}
