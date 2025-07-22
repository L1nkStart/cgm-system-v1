"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CaseData {
    id: string
    doctor?: string
    schedule?: string
    consultory?: string
    status: string
    patientName: string
    date?: string // Existing date field, now used for appointment date
}

interface ScheduleAppointmentFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: (caseId: string, updates: Partial<CaseData>) => void
    initialData: CaseData | null
}

export function ScheduleAppointmentForm({ isOpen, onClose, onSave, initialData }: ScheduleAppointmentFormProps) {
    const [doctor, setDoctor] = useState(initialData?.doctor || "")
    const [schedule, setSchedule] = useState(initialData?.schedule || "")
    const [consultory, setConsultory] = useState(initialData?.consultory || "")
    const [appointmentDate, setAppointmentDate] = useState("") // Nuevo estado para la fecha de la cita
    const { toast } = useToast()

    useEffect(() => {
        if (initialData) {
            setDoctor(initialData.doctor || "")
            setSchedule(initialData.schedule || "")
            setConsultory(initialData.consultory || "")
            // No pre-llenamos appointmentDate desde initialData.date, ya que es la fecha de creación del caso.
            // El usuario debe seleccionar la fecha de la cita.
            setAppointmentDate("")
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!initialData) return

        if (!doctor || !schedule || !consultory || !appointmentDate) {
            toast({
                title: "Error",
                description: "Por favor, complete todos los campos: Médico, Horario, Consultorio y Fecha de Cita.",
                variant: "destructive",
            })
            return
        }

        const updates: Partial<CaseData> = {
            doctor,
            schedule,
            consultory,
            date: appointmentDate, // Usar el campo 'date' del caso para la fecha de la cita
            status: "Agendado",
        }

        onSave(initialData.id, updates)
        onClose()
    }

    if (!initialData) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agendar Cita para Caso: {initialData.patientName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doctor" className="text-right">
                            Médico
                        </Label>
                        <Input
                            id="doctor"
                            value={doctor}
                            onChange={(e) => setDoctor(e.target.value)}
                            className="col-span-3"
                            required
                        />
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
                            required
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
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="appointmentDate" className="text-right">
                            Fecha de Cita
                        </Label>
                        <Input
                            id="appointmentDate"
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                            Agendar Cita
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
