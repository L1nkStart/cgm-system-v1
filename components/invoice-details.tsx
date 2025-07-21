"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface CaseData {
  id: string
  client: string
  date: string
  sinisterNo: string
  idNumber: string
  ciTitular: string
  ciPatient: string
  patientName: string
  patientPhone: string
  assignedAnalystId: string
  status: string
  doctor?: string
  schedule?: string
  consultory?: string
  results?: string
  auditNotes?: string
  clinicCost?: number // New field for clinic cost
  cgmServiceCost?: number // New field for CGM service cost
  totalInvoiceAmount?: number // New field for total amount
}

interface InvoiceDetailsProps {
  isOpen: boolean
  onClose: () => void
  onGenerateInvoice: (caseId: string, clinicCost: number, cgmServiceCost: number) => void
  initialData: CaseData | null
}

export function InvoiceDetails({ isOpen, onClose, onGenerateInvoice, initialData }: InvoiceDetailsProps) {
  const [clinicCost, setClinicCost] = useState<number>(initialData?.clinicCost || 0)
  const [cgmServiceCost, setCgmServiceCost] = useState<number>(initialData?.cgmServiceCost || 0)
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setClinicCost(initialData.clinicCost || 0)
      setCgmServiceCost(initialData.cgmServiceCost || 0)
    }
  }, [initialData])

  const handleGenerate = () => {
    if (!initialData) return
    if (clinicCost <= 0 || cgmServiceCost <= 0) {
      toast({
        title: "Error",
        description: "Los costos de la clínica y del servicio CGM deben ser mayores a cero.",
        variant: "destructive",
      })
      return
    }
    onGenerateInvoice(initialData.id, clinicCost, cgmServiceCost)
    onClose()
  }

  const totalAmount = clinicCost + cgmServiceCost

  if (!initialData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generar Pre-factura para Caso: {initialData.patientName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Cliente:</Label>
            <span className="col-span-3">{initialData.client}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Fecha:</Label>
            <span className="col-span-3">{initialData.date}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Nro. Siniestro:</Label>
            <span className="col-span-3">{initialData.sinisterNo}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Estado:</Label>
            <span className="col-span-3">{initialData.status}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clinicCost" className="text-right">
              Costo de la Clínica:
            </Label>
            <Input
              id="clinicCost"
              type="number"
              value={clinicCost}
              onChange={(e) => setClinicCost(Number.parseFloat(e.target.value) || 0)}
              className="col-span-3"
              min="0"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cgmServiceCost" className="text-right">
              Costo Servicio CGM:
            </Label>
            <Input
              id="cgmServiceCost"
              type="number"
              value={cgmServiceCost}
              onChange={(e) => setCgmServiceCost(Number.parseFloat(e.target.value) || 0)}
              className="col-span-3"
              min="0"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4 font-bold text-lg">
            <Label className="text-right">Total a Facturar:</Label>
            <span className="col-span-3">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} className="bg-orange-600 hover:bg-orange-700 text-white">
            Generar Pre-factura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
