import { DashboardHeader } from "@/components/dashboard-header"
import { CasesTable } from "@/components/cases-table"
import { getFullUserSession, hasRequiredRole } from "@/lib/auth" // Importa getFullUserSession
import { redirect } from "next/navigation"

export default async function AnalystDashboardPage() {
  const session = await getFullUserSession() // Obtiene la sesión completa del usuario
  const userRole = session?.role || "Invitado"
  const analystId = session?.id || null
  const assignedStates = session?.assignedStates || []

  // Redirige si el usuario no tiene el rol de Analista Concertado
  if (!hasRequiredRole(userRole, ["Analista Concertado"])) {
    redirect("/dashboard") // Redirige a un dashboard general o página de acceso denegado
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="flex items-center">
          <h1 className="font-semibold text-lg md:text-2xl">Dashboard del Analista</h1>
        </div>
        <CasesTable
          userRole={userRole}
          analystId={analystId}
          auditorId={null} // No aplica para el dashboard del analista
          statesFilter={assignedStates}
        />
      </main>
    </div>
  )
}
