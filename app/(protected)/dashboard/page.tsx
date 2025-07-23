import { CaseStats } from "@/components/case-stats"
import { CasesTable } from "@/components/cases-table" // Importa CasesTable
import { getFullUserSession, hasRequiredRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getFullUserSession() // Obtiene la sesión completa del usuario
  const userRole = session?.role || "Invitado"
  const userAssignedStates = session?.assignedStates || [] // Obtener los estados asignados del usuario

  // Redirige si el usuario no tiene un rol permitido para este dashboard
  const allowedRoles = [
    "Superusuario",
    "Coordinador Regional",
    "Analista Concertado",
    "Médico Auditor",
    "Jefe Financiero",
  ]
  if (!hasRequiredRole(userRole, allowedRoles)) {
    redirect("/login") // O a una página de acceso denegado
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <CaseStats />
      <CasesTable userRole={userRole} userAssignedStates={userAssignedStates} />
    </div>
  )
}
