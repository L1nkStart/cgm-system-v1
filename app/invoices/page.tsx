"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"

interface Invoice {
  id: string
  caseId: string
  patientName: string
  client: string
  totalAmount: number
  status: string
  invoiceDate: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
    fetchUserRole()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/cases?status=Auditado/Aprobado&invoiceGenerated=true") // Assuming cases with these criteria are invoices
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      // Map case data to invoice structure for display
      const mappedInvoices: Invoice[] = data.map((c: any) => ({
        id: c.id,
        caseId: c.id,
        patientName: c.patientName,
        client: c.client,
        totalAmount: c.totalInvoiceAmount || 0,
        status: c.status, // Use case status as invoice status for now
        invoiceDate: c.date, // Use case date as invoice date for now
      }))
      setInvoices(mappedInvoices)
    } catch (error) {
      console.error("Error fetching invoices:", error)
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
      <h1 className="text-2xl font-bold">Gestión de Facturas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Facturas Generadas</CardTitle>
          <CardDescription>Lista de todas las facturas generadas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Factura</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Factura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id.substring(0, 8)}...</TableCell>
                  <TableCell>{invoice.patientName}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.invoiceDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
