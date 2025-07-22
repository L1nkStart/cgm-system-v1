import { NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"

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
    assignedAnalystName?: string
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
    baremoId?: string
    baremoName?: string
}

interface BaremoProcedure {
    name: string
    type: string
    cost: number
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        const session = await getSession()

        // 1. Authorize user
        if (!session || (session.role !== "Superusuario" && session.role !== "Jefe Financiero")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // 2. Fetch case data
        const [caseRows]: any = await pool.execute(
            `SELECT c.*, u.name AS assignedAnalystName, b.procedures AS baremoProcedures
       FROM cases c
       LEFT JOIN users u ON c.assignedAnalystId = u.id
       LEFT JOIN baremos b ON c.baremoId = b.id
       WHERE c.id = ?`,
            [id],
        )
        const caseData: Case & { baremoProcedures?: string } = caseRows[0]

        if (!caseData) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 })
        }

        if (caseData.status !== "Auditado/Aprobado") {
            return NextResponse.json(
                { error: "Case status must be 'Auditado/Aprobado' to generate pre-invoice" },
                { status: 400 },
            )
        }

        const services: Service[] = caseData.services || []
        let baremoProcedures: BaremoProcedure[] = []
        if (caseData.baremoProcedures) {
            try {
                baremoProcedures = caseData.baremoProcedures
            } catch (parseError) {
                console.error("Error parsing baremo procedures JSON:", parseError)
                baremoProcedures = []
            }
        }

        // 3. Calculate costs
        let totalCost = 0
        const servicesWithCosts = services.map((service) => {
            const matchedProcedure = baremoProcedures.find((proc) => proc.name === service.name && proc.type === service.type)
            const unitCost = matchedProcedure ? matchedProcedure.cost : 0
            const serviceTotal = service.amount * unitCost
            totalCost += serviceTotal
            return {
                ...service,
                unitCost,
                serviceTotal,
            }
        })

        // 4. Generate PDF
        const pdfDoc = await PDFDocument.create()
        let page = pdfDoc.addPage() // Use 'let' to reassign page on new page creation
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

        const { width, height } = page.getSize()
        const margin = 50
        let y = height - margin

        // Header
        page.drawText("PREFACTURA", {
            x: margin,
            y: y,
            font: boldFont,
            size: 24,
            color: rgb(0.1, 0.1, 0.1),
        })
        y -= 30

        // Company Info (Placeholder)
        page.drawText("CGM Sistema de Gestión", { x: margin, y: y, font, size: 12, color: rgb(0.3, 0.3, 0.3) })
        y -= 15
        page.drawText("Rif: J-12345678-9", { x: margin, y: y, font, size: 10, color: rgb(0.3, 0.3, 0.3) })
        y -= 15
        page.drawText("Fecha de Emisión: " + new Date().toLocaleDateString("es-VE"), {
            x: margin,
            y: y,
            font,
            size: 10,
            color: rgb(0.3, 0.3, 0.3),
        })
        y -= 40

        // Case Details
        page.drawText("Detalles del Caso:", { x: margin, y: y, font: boldFont, size: 14, color: rgb(0, 0, 0) })
        y -= 20
        page.drawText(`Cliente: ${caseData.client}`, { x: margin, y: y, font, size: 12, color: rgb(0, 0, 0) })
        y -= 15
        page.drawText(`Paciente: ${caseData.patientName}`, { x: margin, y: y, font, size: 12, color: rgb(0, 0, 0) })
        y -= 15
        page.drawText(`Nro. Siniestro: ${caseData.sinisterNo}`, { x: margin, y: y, font, size: 12, color: rgb(0, 0, 0) })
        y -= 15
        page.drawText(`Fecha del Caso: ${caseData.date}`, { x: margin, y: y, font, size: 12, color: rgb(0, 0, 0) })
        y -= 40

        // Services Table Header
        const tableStartX = margin
        const rowHeight = 20
        const headerColor = rgb(0.9, 0.9, 0.9)
        const textColor = rgb(0, 0, 0)
        const colWidth = [width * 0.3, width * 0.2, width * 0.1, width * 0.15, width * 0.15] // Name, Type, Amount, Unit Cost, Total

        // Draw header rectangle
        page.drawRectangle({
            x: tableStartX,
            y: y - rowHeight, // Bottom of header rectangle
            width: width - 2 * margin,
            height: rowHeight,
            color: headerColor,
        })

        // Draw header text
        page.drawText("Servicio", {
            x: tableStartX + 5,
            y: y - rowHeight + 5, // Text position inside header rectangle
            font: boldFont,
            size: 10,
            color: textColor,
        })
        page.drawText("Tipo", {
            x: tableStartX + colWidth[0] + 5,
            y: y - rowHeight + 5,
            font: boldFont,
            size: 10,
            color: textColor,
        })
        page.drawText("Cant.", {
            x: tableStartX + colWidth[0] + colWidth[1] + 5,
            y: y - rowHeight + 5,
            font: boldFont,
            size: 10,
            color: textColor,
        })
        page.drawText("Costo Unit.", {
            x: tableStartX + colWidth[0] + colWidth[1] + colWidth[2] + 5,
            y: y - rowHeight + 5,
            font: boldFont,
            size: 10,
            color: textColor,
        })
        page.drawText("Total", {
            x: tableStartX + colWidth[0] + colWidth[1] + colWidth[2] + colWidth[3] + 5,
            y: y - rowHeight + 5,
            font: boldFont,
            size: 10,
            color: textColor,
        })

        y -= rowHeight // Move y to the bottom edge of the header rectangle

        // Services Table Rows
        servicesWithCosts.forEach((service) => {
            if (y < margin + rowHeight) {
                // Check if new page is needed (ensure space for at least one more row)
                page = pdfDoc.addPage() // Reassign 'page' to the new page
                y = height - margin // Reset y for new page (top margin)

                // Redraw header on new page
                page.drawRectangle({
                    x: tableStartX,
                    y: y - rowHeight,
                    width: width - 2 * margin,
                    height: rowHeight,
                    color: headerColor,
                })
                page.drawText("Servicio", {
                    x: tableStartX + 5,
                    y: y - rowHeight + 5,
                    font: boldFont,
                    size: 10,
                    color: textColor,
                })
                page.drawText("Tipo", {
                    x: tableStartX + colWidth[0] + 5,
                    y: y - rowHeight + 5,
                    font: boldFont,
                    size: 10,
                    color: textColor,
                })
                page.drawText("Cant.", {
                    x: tableStartX + colWidth[0] + colWidth[1] + 5,
                    y: y - rowHeight + 5,
                    font: boldFont,
                    size: 10,
                    color: textColor,
                })
                page.drawText("Costo Unit.", {
                    x: tableStartX + colWidth[0] + colWidth[1] + colWidth[2] + 5,
                    y: y - rowHeight + 5,
                    font: boldFont,
                    size: 10,
                    color: textColor,
                })
                page.drawText("Total", {
                    x: tableStartX + colWidth[0] + colWidth[1] + colWidth[2] + colWidth[3] + 5,
                    y: y - rowHeight + 5,
                    font: boldFont,
                    size: 10,
                    color: textColor,
                })
                y -= rowHeight // Move y to the bottom of the new header
            }

            // Draw current service row text
            // 'y' is currently the bottom of the previous element (header or previous row)
            // So, the text for the current row should be drawn at 'y - rowHeight + 5'
            page.drawText(service.name, { x: tableStartX + 5, y: y - rowHeight + 5, font, size: 9, color: textColor })
            page.drawText(service.type, {
                x: tableStartX + colWidth[0] + 5,
                y: y - rowHeight + 5,
                font,
                size: 9,
                color: textColor,
            })
            page.drawText(service.amount.toString(), {
                x: tableStartX + colWidth[0] + colWidth[1] + 5,
                y: y - rowHeight + 5,
                font,
                size: 9,
                color: textColor,
            })
            page.drawText(`$${service.unitCost.toFixed(2)}`, {
                x: tableStartX + colWidth[0] + colWidth[1] + colWidth[2] + 5,
                y: y - rowHeight + 5,
                font,
                size: 9,
                color: textColor,
            })
            page.drawText(`$${service.serviceTotal.toFixed(2)}`, {
                x: tableStartX + colWidth[0] + colWidth[1] + colWidth[2] + colWidth[3] + 5,
                y: y - rowHeight + 5,
                font,
                size: 9,
                color: textColor,
            })
            y -= rowHeight // Move y down for the next row
        })

        y -= 20 // Space after table

        // Total Cost
        page.drawText(`Costo Total de Servicios: $${totalCost.toFixed(2)}`, {
            x: width - margin - 150, // Align right
            y: y,
            font: boldFont,
            size: 14,
            color: rgb(0, 0, 0),
        })
        y -= 40

        // Footer
        page.drawText("Gracias por su confianza en CGM Sistema de Gestión.", {
            x: margin,
            y: margin,
            font,
            size: 10,
            color: rgb(0.5, 0.5, 0.5),
        })

        const pdfBytes = await pdfDoc.save()

        // 5. Return PDF
        return new NextResponse(pdfBytes, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="prefactura_caso_${id}.pdf"`,
            },
        })
    } catch (error) {
        console.error("Error generating pre-invoice:", error)
        return NextResponse.json({ error: "Failed to generate pre-invoice" }, { status: 500 })
    }
}
