"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
}

interface AuditCaseFormProps {
  isOpen: boolean
  onClose: () => void
  onAudit: (caseId: string, newStatus: string, auditNotes?: string) => void
  initialData: CaseData | null
}

export function AuditCaseForm({ isOpen, onClose, onAudit, initialData }: AuditCaseFormProps) {
  const [auditNotes, setAuditNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setAuditNotes("") // Reset notes when opening for a new case
    }
  }, [initialData])

  const handleApprove = () => {
    if (!initialData) return
    onAudit(initialData.id, "Auditado/Aprobado", auditNotes)
    onClose()
  }

  const handleReject = () => {
    if (!initialData) return
    if (!auditNotes.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingrese notas de auditoría para el rechazo.",
        variant: "destructive",
      })
      return
    }
    onAudit(initialData.id, "Auditado/Rechazado", auditNotes)
    onClose()
  }

  if (!initialData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Auditar Caso: {initialData.patientName}</DialogTitle>
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
            <Label className="text-right font-semibold">Médico Asignado:</Label>
            <span className="col-span-3">{initialData.doctor || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Horario:</Label>
            <span className="col-span-3">{initialData.schedule || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Consultorio:</Label>
            <span className="col-span-3">{initialData.consultory || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="results" className="text-right pt-2 font-semibold">
              Resultados Registrados:
            </Label>
            <div className="col-span-3 border p-2 rounded-md bg-gray-50 dark:bg-gray-700 text-sm max-h-[150px] overflow-y-auto">
              {initialData.results || "No hay resultados registrados."}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="auditNotes" className="text-right pt-2">
              Notas de Auditoría:
            </Label>
            <Textarea
              id="auditNotes"
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              className="col-span-3 min-h-[80px]"
              placeholder="Ingrese cualquier nota relevante para la auditoría..."
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleReject} variant="destructive">
            Rechazar Auditoría
          </Button>
          <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
            Aprobar Auditoría
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
