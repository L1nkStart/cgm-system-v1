import { CasesTable } from "@/components/cases-table"
import { getFullUserSession } from "@/lib/auth"

export default async function AuditorDashboardPage() {
  const session = await getFullUserSession()
  const userRole = session?.role || "Invitado"
  const userAssignedStates = session?.assignedStates || [] // Get assigned states

  // Add console log for debugging
  console.log("AuditorDashboardPage: userRole =", userRole, "userAssignedStates =", userAssignedStates)

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <h1 className="text-2xl font-bold">Casos Pendientes por Auditoría</h1>
      <CasesTable userRole={userRole} statusFilter="Pendiente por Auditar" userAssignedStates={userAssignedStates} />
    </div>
  )
}
