import { NextResponse } from "next/server"
import pool from "@/lib/db" // Importa el pool de conexiones

export async function GET() {
  try {
    // Calcular el total incurrido de casos
    const [incurredResult]: any = await pool.query(
      "SELECT SUM(totalInvoiceAmount) AS totalIncurred FROM cases WHERE totalInvoiceAmount IS NOT NULL",
    )
    const totalIncurred = incurredResult[0].totalIncurred || 0

    // Calcular el total de pagos
    const [paymentsResult]: any = await pool.query("SELECT SUM(amount) AS totalPayments FROM payments")
    const totalPayments = paymentsResult[0].totalPayments || 0

    const balanceDue = totalIncurred - totalPayments
    const availableBalance = totalPayments - totalIncurred // Simplified, could be more complex

    const summary = {
      totalIncurred: Number.parseFloat(totalIncurred.toFixed(2)),
      totalPayments: Number.parseFloat(totalPayments.toFixed(2)),
      balanceDue: Number.parseFloat(balanceDue.toFixed(2)),
      availableBalance: Number.parseFloat(Math.max(0, availableBalance).toFixed(2)),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching financial summary:", error)
    return NextResponse.json({ error: "Failed to fetch financial summary" }, { status: 500 })
  }
}
