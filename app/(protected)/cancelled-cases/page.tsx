"use client"

import { CasesTable } from "@/components/cases-table"
import { useEffect, useState } from "react"

export default function CancelledCasesPage() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/current-user-role")
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.role)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
      setUserRole(null)
    }
  }

  const allowedRoles = [
    "Superusuario",
    "Coordinador Regional",
    "Analista Concertado",
    "Médico Auditor",
    "Jefe Financiero",
  ]

  if (userRole === null) {
    return <div className="flex items-center justify-center min-h-[60vh]">Cargando permisos...</div>
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500">Acceso denegado. No tienes permisos para ver esta página.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <h1 className="text-2xl font-bold">Casos Anulados</h1>
      <CasesTable fetchUrl="/api/cases" userRole={userRole} statusFilter="Anulado" />
    </div>
  )
}
