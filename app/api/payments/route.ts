import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db" // Importa el pool de conexiones

interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  status: string
  notes?: string
}

export async function GET() {
  try {
    // Obtener pagos y unirlos con información básica del caso (patientName, totalInvoiceAmount)
    const [rows]: any = await pool.query(`
      SELECT p.*, c.patientName, c.totalInvoiceAmount AS invoiceTotal
      FROM payments p
      LEFT JOIN cases c ON p.invoiceId = c.id
    `)

    // Convertir Date objects a string si es necesario para consistencia
    const payments = rows.map((row: any) => ({
      ...row,
      paymentDate: row.paymentDate ? new Date(row.paymentDate).toISOString().split("T")[0] : null,
    }))

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { invoiceId, amount, paymentDate, status, notes } = await req.json()

    if (!invoiceId || !amount || !paymentDate || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newPayment: Payment = {
      id: uuidv4(),
      invoiceId,
      amount,
      paymentDate,
      status,
      notes,
    }

    await pool.execute(
      "INSERT INTO payments (id, invoiceId, amount, paymentDate, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [
        newPayment.id,
        newPayment.invoiceId,
        newPayment.amount,
        newPayment.paymentDate,
        newPayment.status,
        newPayment.notes || null,
      ],
    )

    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const updates = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const updateFields: string[] = []
    const values: any[] = []

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        updateFields.push(`${key} = ?`)
        values.push(updates[key])
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const [result]: any = await pool.execute(`UPDATE payments SET ${updateFields.join(", ")} WHERE id = ?`, values)

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Fetch the updated payment to return
    const [updatedPaymentRows]: any = await pool.execute("SELECT * FROM payments WHERE id = ?", [id])
    const updatedPayment = {
      ...updatedPaymentRows[0],
      paymentDate: updatedPaymentRows[0].paymentDate
        ? new Date(updatedPaymentRows[0].paymentDate).toISOString().split("T")[0]
        : null,
    }
    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    const [result]: any = await pool.execute("DELETE FROM payments WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Payment deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })
  }
}
