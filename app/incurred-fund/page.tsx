"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { DollarSign } from "lucide-react"

interface FinancialSummary {
  totalIncurred: number
  totalPayments: number
  balanceDue: number
  availableBalance: number
}

export default function IncurredFundPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchFinancialSummary()
    fetchUserRole()
  }, [])

  const fetchFinancialSummary = async () => {
    try {
      const res = await fetch("/api/financial-summary")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: FinancialSummary = await res.json()
      setSummary(data)
    } catch (error) {
      console.error("Error fetching financial summary:", error)
      setSummary(null)
    }
  }

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

  const allowedRoles = ["Superusuario", "Jefe Financiero"]

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
      <h1 className="text-2xl font-bold">Fondo Incurrido y Resumen Financiero</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incurrido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.totalIncurred.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Monto total de casos facturados.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos Recibidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.totalPayments.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Monto total de pagos registrados.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.balanceDue.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Diferencia entre incurrido y pagos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fondo Disponible</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.availableBalance.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Fondo restante después de cubrir gastos.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
