"use client"

import { PaymentForm } from "@/components/payment-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  status: string
  notes?: string
  patientName?: string // From joined case data
  invoiceTotal?: number // From joined case data
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
    fetchUserRole()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: Payment[] = await res.json()
      setPayments(data)
    } catch (error) {
      console.error("Error fetching payments:", error)
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

  const handleSavePayment = async () => {
    await fetchPayments() // Refresh the list
    setIsFormOpen(false)
    setEditingPayment(null)
  }

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este pago?")) {
      try {
        const res = await fetch(`/api/payments?id=${id}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        fetchPayments() // Refresh the list
      } catch (error) {
        console.error("Error deleting payment:", error)
      }
    }
  }

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment)
    setIsFormOpen(true)
  }

  const handleNewPaymentClick = () => {
    setEditingPayment(null)
    setIsFormOpen(true)
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewPaymentClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPayment ? "Editar Pago" : "Registrar Nuevo Pago"}</DialogTitle>
            </DialogHeader>
            <PaymentForm payment={editingPayment} onSave={handleSavePayment} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagos</CardTitle>
          <CardDescription>Gestiona los pagos registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pago</TableHead>
                <TableHead>ID Factura (Caso)</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id.substring(0, 8)}...</TableCell>
                  <TableCell>{payment.invoiceId.substring(0, 8)}...</TableCell>
                  <TableCell>{payment.patientName || "N/A"}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(payment)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(payment.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
