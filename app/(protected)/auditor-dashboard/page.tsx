import { CasesTable } from "@/components/cases-table"
import { getSession } from "@/lib/auth" // Importa getSession

export default async function AuditorDashboardPage() {
  const session = await getSession()
  const userRole = session?.role || "Invitado"

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <h1 className="text-2xl font-bold">Casos Pendientes por Auditoría</h1>
      <CasesTable fetchUrl="/api/cases" userRole={userRole} statusFilter="Pendiente por Auditar" />
    </div>
  )
}
