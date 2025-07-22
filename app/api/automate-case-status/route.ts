import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
    try {
        const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format

        console.log(`[Automate Status] Checking for cases to update on: ${today}`)

        // Find cases that are 'Agendado' and whose appointment date is today or in the past
        const [casesToUpdate]: any = await pool.execute(
            `SELECT id, patientName, date, status FROM cases WHERE status = 'Agendado' AND date <= ?`,
            [today],
        )

        if (casesToUpdate.length === 0) {
            console.log("[Automate Status] No cases found to update.")
            return NextResponse.json({ message: "No cases found to update.", updatedCount: 0 })
        }

        console.log(`[Automate Status] Found ${casesToUpdate.length} cases to update.`)

        let updatedCount = 0
        for (const caseItem of casesToUpdate) {
            try {
                await pool.execute(`UPDATE cases SET status = 'Atendido' WHERE id = ?`, [caseItem.id])
                updatedCount++
                console.log(
                    `[Automate Status] Updated case ID: ${caseItem.id} (${caseItem.patientName}) from 'Agendado' to 'Atendido'. Appointment Date: ${caseItem.date}`,
                )
            } catch (updateError) {
                console.error(`[Automate Status] Error updating case ID ${caseItem.id}:`, updateError)
            }
        }

        return NextResponse.json({
            message: `Successfully updated ${updatedCount} cases to 'Atendido'.`,
            updatedCount,
        })
    } catch (error) {
        console.error("[Automate Status] Error in automation process:", error)
        return NextResponse.json({ error: "Failed to automate case status update." }, { status: 500 })
    }
}
