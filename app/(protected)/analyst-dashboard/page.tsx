import { CasesTable } from "@/components/cases-table"
import { getSession } from "@/lib/auth" // Importa getSession

export default async function AnalystDashboardPage() {
  const session = await getSession()
  const userRole = session?.role || "Invitado"
  const analystId = session?.id || "" // Obtener el ID del analista de la sesión
  const userAssignedStates = session?.assignedStates || [] // Get assigned states

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <h1 className="text-2xl font-bold">Mis Casos Asignados</h1>
      <CasesTable userRole={userRole} analystId={analystId} userAssignedStates={userAssignedStates} />
    </div>
  )
}
