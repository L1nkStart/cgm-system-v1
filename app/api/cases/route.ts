import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones
import { getFullUserSession } from "@/lib/auth" // Import getFullUserSession

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
  clientId: string
  date: string
  sinisterNo: string
  idNumber: string
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
  collective?: string
  diagnosis?: string
  provider?: string
  state?: string
  city?: string
  address?: string
  holderId?: string
  services?: Service[]
  typeOfRequirement?: string
  baremoId?: string // Nuevo campo para el ID del baremo
  baremoName?: string // Para display, no en DB directamente
  documents?: Document[] // New: documents field
  patientId?: string // New: patient ID reference
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const analystId = searchParams.get("analystId")
    const statusFilter = searchParams.get("status")
    const statesFilter = searchParams.get("states") // New: filter by states
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const session = await getFullUserSession() // Get current user session

    // Si se solicita un caso específico, no aplicar paginación
    if (id) {
      const query = `
        SELECT
          c.*,
          u.name AS assignedAnalystName,
          b.name AS baremoName,
          p.name AS patientName,
          p.ci AS ciPatient,
          p.phone AS patientPhone,
          p.otherPhone AS patientOtherPhone,
          p.fixedPhone AS patientFixedPhone,
          p.age as patientAge,
          p.birthDate patientBirthDate,
          p.gender patientGender,
          t.name AS holderName,
          cli.name AS clientName
        FROM cases c
        LEFT JOIN users u
          ON c.assignedAnalystId = u.id
        LEFT JOIN baremos b
          ON c.baremoId = b.id
        LEFT JOIN patients p
          ON c.patientId = p.id
        LEFT JOIN insurance_holders t
          ON c.holderId = t.id
        LEFT JOIN clients cli
          ON c.clientId = cli.id
        WHERE c.id = ?
      `
      const [rows]: any = await pool.execute(query, [id])
      console.log("perro", rows)

      if (rows.length > 0) {
        const caseData = {
          ...rows[0],
          services: rows[0].services ? rows[0].services : [],
          documents: rows[0].documents ? rows[0].documents : [],
          preInvoiceDocuments: rows[0].preInvoiceDocuments ? rows[0].preInvoiceDocuments : [],
          date: rows[0].date ? new Date(rows[0].date).toISOString().split("T")[0] : null,
          patientBirthDate: rows[0].patientBirthDate
            ? new Date(rows[0].patientBirthDate).toISOString().split("T")[0]
            : null,
          clinicCost: rows[0].clinicCost !== null ? Number(rows[0].clinicCost) : null,
          cgmServiceCost: rows[0].cgmServiceCost !== null ? Number(rows[0].cgmServiceCost) : null,
          totalInvoiceAmount: rows[0].totalInvoiceAmount !== null ? Number(rows[0].totalInvoiceAmount) : null,
        }

        // Verificar permisos de estado si es necesario
        if (session && (session.role === "Analista Concertado" || session.role === "Médico Auditor")) {
          const userAssignedStates = session.assignedStates || []
          if (userAssignedStates.length > 0 && !userAssignedStates.includes(caseData.state)) {
            return NextResponse.json({ error: "Access denied to this case based on assigned states" }, { status: 403 })
          }
        }

        return NextResponse.json(caseData)
      }
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Construir condiciones WHERE
    const whereConditions: string[] = ["1=1"]
    const queryParams: any[] = []

    if (analystId) {
      whereConditions.push("c.assignedAnalystId = ?")
      queryParams.push(analystId)
    }

    if (statusFilter) {
      const statuses = statusFilter.split(",")
      const statusPlaceholders = statuses.map(() => "?").join(",")
      whereConditions.push(`c.status IN (${statusPlaceholders})`)
      queryParams.push(...statuses)
    }

    // Apply state filtering based on user role and assigned states
    if (session && (session.role === "Analista Concertado" || session.role === "Médico Auditor")) {
      const userAssignedStates = session.assignedStates || []
      if (userAssignedStates.length > 0) {
        const statePlaceholders = userAssignedStates.map(() => "?").join(",")
        whereConditions.push(`c.state IN (${statePlaceholders})`)
        queryParams.push(...userAssignedStates)
      } else {
        // If user has these roles but no states assigned, they should see no cases
        whereConditions.push("1=0")
      }
    } else if (statesFilter) {
      // Allow filtering by states if not an analyst/auditor (e.g., for Superusuario)
      const states = statesFilter.split(",")
      if (states.length > 0 && states[0] !== "") {
        const statePlaceholders = states.map(() => "?").join(",")
        whereConditions.push(`c.state IN (${statePlaceholders})`)
        queryParams.push(...states)
      }
    }

    const whereClause = whereConditions.join(" AND ")

    // Consulta de conteo
    const countQuery = `
      SELECT COUNT(*) as total
      FROM cases c
      LEFT JOIN users u ON c.assignedAnalystId = u.id
      LEFT JOIN baremos b ON c.baremoId = b.id
      LEFT JOIN patients p ON c.patientId = p.id
      WHERE ${whereClause}
    `

    const [countRows]: any = await pool.execute(countQuery, queryParams)
    const totalCases = countRows[0].total

    // Consulta principal con paginación
    const offset = (page - 1) * limit

    // ===== INICIO DE LA CORRECCIÓN =====

    const mainQuery = `
      SELECT
          c.*,
          u.name AS assignedAnalystName,
          b.name AS baremoName,
          p.name AS patientName,
          p.ci AS ciPatient,
          p.phone AS patientPhone,
          t.name AS holderName,
          cli.name AS clientName
        FROM cases c
        LEFT JOIN users u
          ON c.assignedAnalystId = u.id
        LEFT JOIN baremos b
          ON c.baremoId = b.id
        LEFT JOIN patients p
          ON c.patientId = p.id
        LEFT JOIN insurance_holders t
          ON c.holderId = t.id
        LEFT JOIN clients cli
          ON c.clientId = cli.id
      WHERE ${whereClause}
      ORDER BY c.date DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    // No se crea un array de parámetros adicional. Se usan los queryParams directamente.
    const [rows]: any = await pool.execute(mainQuery, queryParams)
    console.log("azul", rows)

    // ===== FIN DE LA CORRECCIÓN =====

    // Parse JSON fields and ensure correct types
    const cases = rows.map((row: any) => ({
      ...row,
      services: row.services ? row.services : [],
      documents: row.documents ? row.documents : [],
      preInvoiceDocuments: row.preInvoiceDocuments ? row.preInvoiceDocuments : [],
      date: row.date ? new Date(row.date).toISOString().split("T")[0] : null,
      patientBirthDate: row.patientBirthDate ? new Date(row.patientBirthDate).toISOString().split("T")[0] : null,
      clinicCost: row.clinicCost !== null ? Number(row.clinicCost) : null,
      cgmServiceCost: row.cgmServiceCost !== null ? Number(row.cgmServiceCost) : null,
      totalInvoiceAmount: row.totalInvoiceAmount !== null ? Number(row.totalInvoiceAmount) : null,
    }))

    // Return paginated response
    return NextResponse.json({
      cases,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCases / limit),
        totalCases,
        limit,
        hasNextPage: page < Math.ceil(totalCases / limit),
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const {
      clientId,
      date,
      assignedAnalystId,
      status,
      creatorName,
      creatorEmail,
      creatorPhone,
      collective,
      diagnosis,
      provider,
      state,
      city,
      address,
      services,
      typeOfRequirement,
      baremoId, // Nuevo campo
      documents, // New: documents field
      patientId, // New: patient ID reference
      holderId
    } = await req.json()

    if (
      !clientId ||
      !date ||
      !holderId ||
      !baremoId ||
      !assignedAnalystId ||
      !status ||
      !state
    ) {
      console.log(!clientId,
        !date,
        !holderId,
        !baremoId,
        !assignedAnalystId,
        !status,
        !state)
      return NextResponse.json(
        {
          error:
            `Faltan campos importantes ${holderId}`,
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
      date,
      sinisterNo: Math.floor(Math.random() * 100000).toString(),
      idNumber: `V-${Math.floor(Math.random() * 10000000).toString()}`,
      assignedAnalystId,
      status,
      clinicCost: 0,
      cgmServiceCost: 0,
      totalInvoiceAmount: 0,
      invoiceGenerated: false,
      creatorName: creatorName || "SYS", // Mantener default si no se envía
      creatorEmail: creatorEmail || "SYS@cgm.com", // Mantener default si no se envía
      creatorPhone: creatorPhone || "0412-9999999", // Mantener default si no se envía
      collective: collective || null,
      diagnosis: diagnosis || null,
      provider: provider || null,
      state: state || null, // Save case state
      city: city || null,
      address: address || null,
      holderId: holderId,
      services: services || [],
      typeOfRequirement: typeOfRequirement || "CONSULTA",
      baremoId, // Incluir el baremoId
      documents: documents || [], // Initialize documents
      patientId: patientId || null, // Include patient ID reference
    }

    await pool.execute(
      `INSERT INTO cases (
      id, clientId, date, sinisterNo, idNumber,
      assignedAnalystId, status, doctor, schedule, consultory, results, auditNotes, clinicCost,
      cgmServiceCost, totalInvoiceAmount, invoiceGenerated, creatorName, creatorEmail, creatorPhone, collective,
      diagnosis, provider, state, city, address, holderId, services, typeOfRequirement, baremoId, documents, patientId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCase.id,
        newCase.clientId,
        newCase.date,
        newCase.sinisterNo,
        newCase.idNumber,
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
        newCase.collective,
        newCase.diagnosis,
        newCase.provider,
        newCase.state,
        newCase.city,
        newCase.address,
        newCase.holderId,
        JSON.stringify(newCase.services),
        newCase.typeOfRequirement,
        newCase.baremoId,
        JSON.stringify(newCase.documents),
        newCase.patientId,
      ],
    )

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: error }, { status: 500 })
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
      "SELECT assignedAnalystId, state, status, documents, preInvoiceDocuments FROM cases WHERE id = ?",
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
            analyst.assignedStates && typeof analyst.assignedStates === "string" && analyst.assignedStates.length > 0
              ? JSON.parse(analyst.assignedStates)
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
    // This logic applies if documents are being updated AND the current status is "Atendido"
    if (updates.documents && currentCase.status === "Atendido") {
      updates.status = "Pendiente por Auditar"
      console.log(`Case ${id} status changed to 'Pendiente por Auditar' due to document upload.`)
    }

    const updateFields: string[] = []
    const values: any[] = []

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "services" || key === "documents" || key === "preInvoiceDocuments") {
          // Handle JSON fields
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
      preInvoiceDocuments: updatedCaseRows[0].preInvoiceDocuments
        ? updatedCaseRows[0].preInvoiceDocuments
        : [],
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

// ... (tu código existente de GET, POST y PUT)

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 });
    }

    // Ejecuta la sentencia DELETE
    const [result]: any = await pool.execute("DELETE FROM cases WHERE id = ?", [id]);

    // Si no se eliminó ninguna fila, significa que el caso no se encontró
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ message: `Case with ID ${id} deleted successfully.` }, { status: 200 });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}