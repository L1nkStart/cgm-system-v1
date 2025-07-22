import { CaseStats } from "@/components/case-stats"
import { CasesTable } from "@/components/cases-table"
import { getSession } from "@/lib/auth" // Importa getSession

export default async function DashboardPage() {
  const session = await getSession()
  const userRole = session?.role || "Invitado"
  const userAssignedStates = session?.assignedStates || [] // Get assigned states

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <CaseStats />
      <CasesTable userRole={userRole} userAssignedStates={userAssignedStates} />
    </div>
  )
}
