"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Import Textarea
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
  results?: string // New field for results
}

interface EditCaseFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (caseId: string, updates: Partial<CaseData>) => void
  initialData: CaseData | null
}

export function EditCaseForm({ isOpen, onClose, onSave, initialData }: EditCaseFormProps) {
  const [doctor, setDoctor] = useState(initialData?.doctor || "")
  const [schedule, setSchedule] = useState(initialData?.schedule || "")
  const [consultory, setConsultory] = useState(initialData?.consultory || "")
  const [results, setResults] = useState(initialData?.results || "") // State for results
  const [status, setStatus] = useState(initialData?.status || "Pendiente")
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setDoctor(initialData.doctor || "")
      setSchedule(initialData.schedule || "")
      setConsultory(initialData.consultory || "")
      setResults(initialData.results || "") // Set initial results
      setStatus(initialData.status || "Pendiente")
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!initialData) return

    const updates: Partial<CaseData> = {
      doctor,
      schedule,
      consultory,
      results, // Include results in updates
      status,
    }

    // If results are added and status is not already 'Pendiente por Auditar', set it.
    if (results && status !== "Pendiente por Auditar" && status !== "Auditado/Aprobado") {
      updates.status = "Pendiente por Auditar"
    }

    onSave(initialData.id, updates)
    onClose()
  }

  const statusOptions = [
    "Pendiente",
    "Agendado",
    "Atendido",
    "Remesado",
    "Priorizado",
    "Anulado",
    "Pendiente por Auditar", // Added for clarity, though it will be set automatically
    "Auditado/Aprobado",
    "Auditado/Rechazado",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Caso: {initialData?.patientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doctor" className="text-right">
              Médico
            </Label>
            <Input id="doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule" className="text-right">
              Horario
            </Label>
            <Input
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="col-span-3"
              placeholder="Ej: 10:00 AM"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="consultory" className="text-right">
              Consultorio
            </Label>
            <Input
              id="consultory"
              value={consultory}
              onChange={(e) => setConsultory(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Consultorio 3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="results" className="text-right pt-2">
              Resultados (Diagnósticos, Exámenes, etc.)
            </Label>
            <Textarea
              id="results"
              value={results}
              onChange={(e) => setResults(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Ingrese los resultados de la cita aquí..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Estado
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
