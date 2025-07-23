import { NewCaseForm } from "@/components/new-case-form"
import { getFullUserSession } from "@/lib/auth" // Importa getSession

export default async function NewCasePage() {
  const session = await getFullUserSession()
  const userRole = session?.role || "Invitado"

  if (userRole !== "Superusuario" && userRole !== "Coordinador Regional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500">Acceso denegado. No tienes permisos para crear nuevos casos.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <h1 className="text-2xl font-bold">Crear Nuevo Caso</h1>
      <NewCaseForm />
    </div>
  )
}
