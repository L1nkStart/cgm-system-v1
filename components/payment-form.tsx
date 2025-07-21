"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface PaymentData {
  id?: string
  invoiceId: string // Link to a case/invoice
  amount: number
  paymentDate: string
  status: string
  notes?: string
}

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payment: PaymentData) => void
  initialData?: PaymentData | null
  availableInvoices?: { id: string; patientName: string; totalInvoiceAmount: number }[] // For linking payments
}

export function PaymentForm({ isOpen, onClose, onSave, initialData, availableInvoices = [] }: PaymentFormProps) {
  const [invoiceId, setInvoiceId] = useState(initialData?.invoiceId || "")
  const [amount, setAmount] = useState(initialData?.amount || 0)
  const [paymentDate, setPaymentDate] = useState(initialData?.paymentDate || "")
  const [status, setStatus] = useState(initialData?.status || "Pendiente")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setInvoiceId(initialData.invoiceId)
      setAmount(initialData.amount)
      setPaymentDate(initialData.paymentDate)
      setStatus(initialData.status)
      setNotes(initialData.notes || "")
    } else {
      setInvoiceId("")
      setAmount(0)
      setPaymentDate("")
      setStatus("Pendiente")
      setNotes("")
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceId || amount <= 0 || !paymentDate || !status) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos requeridos y asegúrese que el monto sea mayor a cero.",
        variant: "destructive",
      })
      return
    }

    onSave({
      id: initialData?.id,
      invoiceId,
      amount,
      paymentDate,
      status,
      notes,
    })
    onClose()
  }

  const paymentStatuses = ["Pendiente", "Pagado", "Parcial", "Anulado"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Pago" : "Registrar Nuevo Pago"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="invoiceId" className="text-right">
              Caso / Pre-factura
            </Label>
            <Select value={invoiceId} onValueChange={setInvoiceId} required disabled={!!initialData}>
              <SelectTrigger id="invoiceId" className="col-span-3">
                <SelectValue placeholder="Seleccione una pre-factura" />
              </SelectTrigger>
              <SelectContent>
                {availableInvoices.length === 0 ? (
                  <SelectItem value="" disabled>
                    No hay pre-facturas disponibles
                  </SelectItem>
                ) : (
                  availableInvoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.patientName} (Total: ${inv.totalInvoiceAmount?.toFixed(2)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Monto
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
              className="col-span-3"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentDate" className="text-right">
              Fecha de Pago
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Estado
            </Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3 min-h-[80px]"
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              {initialData ? "Guardar Cambios" : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
