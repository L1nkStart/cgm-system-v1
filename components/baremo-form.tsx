"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, MinusCircle } from "lucide-react"

interface Procedure {
  name: string
  cost: number
  isActive: boolean // Añadido
  type: string // Añadido
}

interface BaremoData {
  id?: string
  name: string
  clinicName: string
  effectiveDate: string
  procedures: Procedure[]
}

interface BaremoFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (baremo: BaremoData) => void
  initialData?: BaremoData | null
}

export function BaremoForm({ isOpen, onClose, onSave, initialData }: BaremoFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [clinicName, setClinicName] = useState(initialData?.clinicName || "")
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || "")
  const [procedures, setProcedures] = useState<Procedure[]>(
    initialData?.procedures && initialData.procedures.length > 0
      ? initialData.procedures
      : [{ name: "", cost: 0, isActive: true, type: "Servicio" }], // Valores por defecto
  )
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setClinicName(initialData.clinicName)
      setEffectiveDate(initialData.effectiveDate)
      // Asegurarse de que los procedimientos tengan isActive y type, si no, añadir valores por defecto
      setProcedures(
        initialData.procedures.length > 0
          ? initialData.procedures.map((p) => ({
            ...p,
            isActive: p.isActive ?? true, // Si no existe, por defecto true
            type: p.type ?? "Servicio", // Si no existe, por defecto "Servicio"
          }))
          : [{ name: "", cost: 0, isActive: true, type: "Servicio" }],
      )
    } else {
      setName("")
      setClinicName("")
      setEffectiveDate("")
      setProcedures([{ name: "", cost: 0, isActive: true, type: "Servicio" }]) // Valores por defecto
    }
  }, [initialData])

  const handleProcedureChange = (index: number, field: keyof Procedure, value: string | number | boolean) => {
    const newProcedures = [...procedures]
    if (field === "cost") {
      newProcedures[index][field] = Number.parseFloat(value as string) || 0
    } else if (field === "isActive") {
      newProcedures[index][field] = value as boolean
    } else {
      newProcedures[index][field] = value as string
    }
    setProcedures(newProcedures)
  }

  const addProcedure = () => {
    setProcedures([...procedures, { name: "", cost: 0, isActive: true, type: "Servicio" }]) // Valores por defecto
  }

  const removeProcedure = (index: number) => {
    const newProcedures = procedures.filter((_, i) => i !== index)
    setProcedures(newProcedures.length > 0 ? newProcedures : [{ name: "", cost: 0, isActive: true, type: "Servicio" }])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !clinicName || !effectiveDate) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos principales del baremo.",
        variant: "destructive",
      })
      return
    }
    if (procedures.some((p) => !p.name || p.cost <= 0)) {
      toast({
        title: "Error",
        description: "Todos los procedimientos deben tener un nombre y un costo mayor a cero.",
        variant: "destructive",
      })
      return
    }

    onSave({
      id: initialData?.id,
      name,
      clinicName,
      effectiveDate,
      procedures,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Baremo" : "Crear Nuevo Baremo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre del Baremo
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clinicName" className="text-right">
              Clínica
            </Label>
            <Input
              id="clinicName"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="effectiveDate" className="text-right">
              Fecha de Vigencia
            </Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <h3 className="text-lg font-semibold mt-4 col-span-4">Procedimientos</h3>
          {procedures.map((procedure, index) => (
            <div key={index} className="grid grid-cols-5 items-center gap-4 border-t pt-4">
              <Label htmlFor={`procedure-name-${index}`} className="text-right">
                Procedimiento {index + 1}
              </Label>
              <Input
                id={`procedure-name-${index}`}
                value={procedure.name}
                onChange={(e) => handleProcedureChange(index, "name", e.target.value)}
                className="col-span-2"
                placeholder="Nombre del procedimiento"
                required
              />
              <Input
                id={`procedure-cost-${index}`}
                type="number"
                value={procedure.cost}
                onChange={(e) => handleProcedureChange(index, "cost", e.target.value)}
                className="col-span-1"
                placeholder="Costo"
                min="0"
                step="0.01"
                required
              />
              {/* Añadir campos para isActive y type si se desean editar en el formulario */}
              {/* Por ahora, se mantienen los valores por defecto o los existentes */}
              <Button variant="ghost" size="icon" onClick={() => removeProcedure(index)} className="ml-auto">
                <MinusCircle className="h-5 w-5 text-red-500" />
                <span className="sr-only">Eliminar procedimiento</span>
              </Button>
            </div>
          ))}
          <div className="col-span-5 flex justify-center">
            <Button type="button" variant="outline" onClick={addProcedure}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Procedimiento
            </Button>
          </div>

          <DialogFooter className="col-span-5 mt-4">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              {initialData ? "Guardar Cambios" : "Crear Baremo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
