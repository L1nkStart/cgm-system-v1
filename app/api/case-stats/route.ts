import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
    try {
        // Query to get the count of cases for each status
        const [rows]: any = await pool.query(`
      SELECT status, COUNT(id) AS count
      FROM cases
      GROUP BY status
    `)

        // Map the results to a more usable format
        const statsMap = new Map<string, number>()
        rows.forEach((row: { status: string; count: number }) => {
            statsMap.set(row.status, row.count)
        })

        // Define all possible statuses and their default colors
        const allStatuses = [
            { label: "Priorizado", status: "Priorizado", color: "bg-blue-500" },
            { label: "Pendiente", status: "Pendiente", color: "bg-orange-500" },
            { label: "Agendado", status: "Agendado", color: "bg-green-500" },
            { label: "Atendido", status: "Atendido", color: "bg-emerald-500" },
            { label: "Remesado", status: "Remesado", color: "bg-red-500" },
            { label: "Anulado", status: "Anulado", color: "bg-red-500" },
            { label: "Pendiente por Auditar", status: "Pendiente por Auditar", color: "bg-yellow-500" },
            { label: "Auditado/Aprobado", status: "Auditado/Aprobado", color: "bg-purple-600" },
            { label: "Auditado/Rechazado", status: "Auditado/Rechazado", color: "bg-red-600" },
            { label: "Pre-facturado", status: "Pre-facturado", color: "bg-indigo-500" },
        ]

        // Combine with actual counts, defaulting to 0 if no cases for a status
        const formattedStats = allStatuses.map((s) => ({
            label: s.label,
            value: statsMap.get(s.status) || 0,
            color: s.color,
        }))

        return NextResponse.json(formattedStats)
    } catch (error) {
        console.error("Error fetching case stats:", error)
        return NextResponse.json({ error: "Failed to fetch case statistics" }, { status: 500 })
    }
}
