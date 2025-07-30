import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones
import { getFullUserSession } from "@/lib/auth"

// Define las interfaces para los datos (pueden estar en un archivo de tipos separado)
interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface Document {
  name: string
  url: string
}

interface Case {
  id: string
  client: string
  clientId: string
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
  baremoId?: string // Nuevo campo para el ID del baremo
  baremoName?: string // Para display, no en DB directamente
  documents?: Document[] // New: documents field
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const analystId = searchParams.get("analystId")
    const statusFilter = searchParams.get("status")
    const statesFilter = searchParams.get("states") // New: filter by states

    const session = await getFullUserSession() // Get current user session
    console.log("API /api/cases GET: statesFilter from URL =", statesFilter)
    console.log(
      "API /api/cases GET: session.role =",
      session?.role,
      "session.assignedStates =",
      session?.assignedStates,
    )

    let query = `
      SELECT c.*, u.name AS assignedAnalystName, b.name AS baremoName
      FROM cases c
      LEFT JOIN users u ON c.assignedAnalystId = u.id
      LEFT JOIN baremos b ON c.baremoId = b.id
      WHERE 1=1
    `
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

    // Apply state filtering based on user role and assigned states
    // Note: session.assignedStates should already be an array if handled correctly on user login/fetch
    if (session && (session.role === "Analista Concertado" || session.role === "Médico Auditor")) {
      const userAssignedStates = session.assignedStates || [] // Ensure it's an array
      if (userAssignedStates.length > 0) {
        query += ` AND c.state IN (${userAssignedStates.map(() => "?").join(",")})`
        params.push(...userAssignedStates)
      } else {
        // If user has these roles but no states assigned, they should see no cases
        query += " AND 1=0" // Force no results
      }
    } else if (statesFilter) {
      // Allow filtering by states if not an analyst/auditor (e.g., for Superusuario)
      const states = statesFilter.split(",")
      // Added a check to ensure 'states' is not empty after split
      if (states.length > 0 && states[0] !== "") {
        query += ` AND c.state IN (${states.map(() => "?").join(",")})`
        params.push(...states)
      }
    }

    const [rows]: any = await pool.execute(query, params)
    console.log(rows, "RD")

    // Parse JSON fields and ensure correct types
    const cases = rows.map((row: any) => {
      let services = []
      let documents = []

      if (row.services.length > 0) {
        try {
          services = row.services
        } catch (error) {
          console.error(`Error parsing services for case ID ${row.id}:`, row.services, error)
        }
      }

      if (typeof row.documents === "string" && row.documents.length > 0) {
        try {
          documents = JSON.parse(row.documents)
        } catch (error) {
          console.error(`Error parsing documents for case ID ${row.id}:`, row.documents, error)
        }
      }
      console.log(services, "AAA")

      return {
        ...row,
        services: services,
        documents: documents,
        // Convert Date objects to string if needed for consistency
        date: row.date ? new Date(row.date).toISOString().split("T")[0] : null,
        patientBirthDate: row.patientBirthDate ? new Date(row.patientBirthDate).toISOString().split("T")[0] : null,
        // Convert numeric fields to actual numbers, handling potential string numbers from DB
        clinicCost: row.clinicCost !== null ? Number(row.clinicCost) : null,
        cgmServiceCost: row.cgmServiceCost !== null ? Number(row.cgmServiceCost) : null,
        totalInvoiceAmount: row.totalInvoiceAmount !== null ? Number(row.totalInvoiceAmount) : null,
      }
    })

    if (id) {
      if (cases.length > 0) {
        // If fetching a single case, ensure it matches the user's assigned states if applicable
        if (session && (session.role === "Analista Concertado" || session.role === "Médico Auditor")) {
          const userAssignedStates = session.assignedStates || []
          // Assuming `cases[0].state` is a simple string like "Carabobo"
          if (userAssignedStates.length > 0 && !userAssignedStates.includes(cases[0].state)) {
            return NextResponse.json({ error: "Access denied to this case based on assigned states" }, { status: 403 })
          }
        }
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
      clientId,
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
      state, // New: case state
      city,
      address,
      holderCI,
      services,
      typeOfRequirement,
      baremoId, // Nuevo campo
      documents, // New: documents field
    } = await req.json()

    if (
      !clientId ||
      !date ||
      !patientName ||
      !ciPatient ||
      !patientPhone ||
      !assignedAnalystId ||
      !status ||
      !baremoId ||
      !state
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: client, date, patientName, ciPatient, patientPhone, assignedAnalystId, status, baremoId, state",
        },
        { status: 400 },
      )
    }

    // Validate if the assigned analyst can handle cases from this state
    const [analystRows]: any = await pool.execute("SELECT assignedStates FROM users WHERE id = ?", [assignedAnalystId])
    const analyst = analystRows[0]
    if (analyst && analyst.assignedStates) {
      const analystStates = analyst.assignedStates
      if (!analystStates.includes(state)) {
        return NextResponse.json(
          { error: `El analista asignado no puede manejar casos del estado: ${state}` },
          { status: 400 },
        )
      }
    } else if (
      analyst &&
      analyst.assignedStates === null &&
      (analyst.role === "Analista Concertado" || analyst.role === "Médico Auditor")
    ) {
      // If analyst has no states assigned but is an analyst/auditor, they cannot be assigned cases
      return NextResponse.json(
        { error: `El analista asignado no tiene estados asignados y no puede manejar casos.` },
        { status: 400 },
      )
    }

    const newCase: Case = {
      id: uuidv4(),
      clientId,
      client,
      date,
      sinisterNo: Math.floor(Math.random() * 100000).toString(),
      idNumber: `V-${Math.floor(Math.random() * 10000000).toString()}`,
      ciTitular: `V-${Math.floor(Math.random() * 10000000).toString()}`, // Usar el valor del formulario o generar
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
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender: patientGender || null,
      collective: collective || null,
      diagnosis: diagnosis || null,
      provider: provider || null,
      state: state || null, // Save case state
      city: city || null,
      address: address || null,
      holderCI: holderCI || null, // Usar el valor del formulario o null
      services: services || [],
      typeOfRequirement: typeOfRequirement || "CONSULTA",
      baremoId, // Incluir el baremoId
      documents: documents || [], // Initialize documents
    }

    await pool.execute(
      `INSERT INTO cases (
     id, clientId, client, date, sinisterNo, idNumber, ciTitular, ciPatient, patientName, patientPhone,
     assignedAnalystId, status, doctor, schedule, consultory, results, auditNotes, clinicCost,
     cgmServiceCost, totalInvoiceAmount, invoiceGenerated, creatorName, creatorEmail, creatorPhone,
     patientOtherPhone, patientFixedPhone, patientBirthDate, patientAge, patientGender, collective,
     diagnosis, provider, state, city, address, holderCI, services, typeOfRequirement, baremoId, documents
   ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCase.id,
        newCase.clientId,
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
        newCase.state, // Save case state
        newCase.city,
        newCase.address,
        newCase.holderCI,
        JSON.stringify(newCase.services),
        newCase.typeOfRequirement,
        newCase.baremoId, // Añadir baremoId a los valores
        JSON.stringify(newCase.documents), // Save documents
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

    console.log("Received updates for case PUT:", updates) // For debugging

    if (!id) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    // Fetch current case data to determine status change logic and analyst state validation
    const [currentCaseRows]: any = await pool.execute(
      "SELECT assignedAnalystId, state, status, documents FROM cases WHERE id = ?",
      [id],
    )
    const currentCase = currentCaseRows[0]

    if (!currentCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Validate if assignedAnalystId or state is being updated
    if (updates.assignedAnalystId || updates.state) {
      const newAssignedAnalystId = updates.assignedAnalystId || currentCase.assignedAnalystId
      const newCaseState = updates.state || currentCase.state

      if (newAssignedAnalystId && newCaseState) {
        const [analystRows]: any = await pool.execute("SELECT assignedStates, role FROM users WHERE id = ?", [
          newAssignedAnalystId,
        ])
        const analyst = analystRows[0]

        if (analyst) {
          // Safely parse assignedStates, handling null or empty string
          const analystStates =
            analyst.assignedStates && analyst.assignedStates.length > 0
              ? analyst.assignedStates
              : []

          if (analyst.role === "Analista Concertado" || analyst.role === "Médico Auditor") {
            if (analystStates.length === 0) {
              return NextResponse.json(
                { error: `El analista asignado no tiene estados asignados y no puede manejar casos.` },
                { status: 400 },
              )
            }
            if (!analystStates.includes(newCaseState)) {
              return NextResponse.json(
                { error: `El analista asignado no puede manejar casos del estado: ${newCaseState}` },
                { status: 400 },
              )
            }
          }
        }
      }
    }

    // Logic for automatic status change to "Pendiente por Auditar" after document upload
    if (updates.documents && currentCase.status === "Atendido") {
      updates.status = "Pendiente por Auditar"
      console.log(`Case ${id} status changed to 'Pendiente por Auditar' due to document upload.`)
    }

    const updateFields: string[] = []
    const values: any[] = []

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "services" || key === "documents") {
          // Handle both services and documents as JSON
          updateFields.push(`${key} = ?`)
          values.push(JSON.stringify(updates[key])) // Stringify JSON field when sending to DB
        } else {
          updateFields.push(`${key} = ?`)
          values.push(updates[key])
        }
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }
    console.log("Debug: ", updateFields)
    values.push(id)
    const [result]: any = await pool.execute(`UPDATE cases SET ${updateFields.join(", ")} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Fetch the updated case to return
    const [updatedCaseRows]: any = await pool.execute("SELECT * FROM cases WHERE id = ?", [id])
    const updatedCase = {
      ...updatedCaseRows[0],
      services: updatedCaseRows[0].services ? updatedCaseRows[0].services : [],
      documents: updatedCaseRows[0].documents ? updatedCaseRows[0].documents : [],
      date: updatedCaseRows[0].date ? new Date(updatedCaseRows[0].date).toISOString().split("T")[0] : null,
      patientBirthDate: updatedCaseRows[0].patientBirthDate
        ? new Date(updatedCaseRows[0].patientBirthDate).toISOString().split("T")[0]
        : null,
      // Convert numeric fields to actual numbers
      clinicCost: updatedCaseRows[0].clinicCost !== null ? Number(updatedCaseRows[0].clinicCost) : null,
      cgmServiceCost: updatedCaseRows[0].cgmServiceCost !== null ? Number(updatedCaseRows[0].cgmServiceCost) : null,
      totalInvoiceAmount:
        updatedCaseRows[0].totalInvoiceAmount !== null ? Number(updatedCaseRows[0].totalInvoiceAmount) : null,
    }
    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Error updating case:", error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}
