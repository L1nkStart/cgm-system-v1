"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, MinusCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Importar Select
import { Checkbox } from "@/components/ui/checkbox" // Importar Checkbox

interface Procedure {
  name: string
  cost: number
  isActive: boolean
  type: string
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
      ? initialData.procedures.map((p) => ({
        ...p,
        isActive: p.isActive ?? true,
        type: p.type ?? "Servicio",
      }))
      : [{ name: "", cost: 0, isActive: true, type: "Servicio" }],
  )
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setClinicName(initialData.clinicName)
      setEffectiveDate(initialData.effectiveDate)
      setProcedures(
        initialData.procedures.length > 0
          ? initialData.procedures.map((p) => ({
            ...p,
            isActive: p.isActive ?? true,
            type: p.type ?? "Servicio",
          }))
          : [{ name: "", cost: 0, isActive: true, type: "Servicio" }],
      )
    } else {
      setName("")
      setClinicName("")
      setEffectiveDate("")
      setProcedures([{ name: "", cost: 0, isActive: true, type: "Servicio" }])
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
    setProcedures([...procedures, { name: "", cost: 0, isActive: true, type: "Servicio" }])
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
      <DialogContent className="sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Baremo" : "Crear Nuevo Baremo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Sección de Información General del Baremo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Baremo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clínica</Label>
              <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Fecha de Vigencia</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Sección de Procedimientos */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Procedimientos</h3>
            <div className="grid gap-4">
              {procedures.map((procedure, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                    <div className="space-y-1">
                      <Label htmlFor={`procedure-name-${index}`} className="text-sm">
                        Nombre
                      </Label>
                      <Input
                        id={`procedure-name-${index}`}
                        value={procedure.name}
                        onChange={(e) => handleProcedureChange(index, "name", e.target.value)}
                        placeholder="Nombre del procedimiento"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`procedure-cost-${index}`} className="text-sm">
                        Costo (Bs.)
                      </Label>
                      <Input
                        id={`procedure-cost-${index}`}
                        type="number"
                        value={procedure.cost}
                        onChange={(e) => handleProcedureChange(index, "cost", e.target.value)}
                        placeholder="Costo"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`procedure-type-${index}`} className="text-sm">
                        Tipo
                      </Label>
                      <Select
                        value={procedure.type}
                        onValueChange={(value) => handleProcedureChange(index, "type", value)}
                      >
                        <SelectTrigger id={`procedure-type-${index}`}>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Servicio">Servicio</SelectItem>
                          <SelectItem value="Examen">Examen</SelectItem>
                          <SelectItem value="Consulta">Consulta</SelectItem>
                          <SelectItem value="Procedimiento">Procedimiento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-2 md:pt-0">
                      <Checkbox
                        id={`procedure-active-${index}`}
                        checked={procedure.isActive}
                        onCheckedChange={(checked) => handleProcedureChange(index, "isActive", checked as boolean)}
                      />
                      <Label
                        htmlFor={`procedure-active-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Activo
                      </Label>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProcedure(index)}
                    className="shrink-0 mt-3 md:mt-0"
                    aria-label="Eliminar procedimiento"
                  >
                    <MinusCircle className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Button type="button" variant="outline" onClick={addProcedure}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Procedimiento
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              {initialData ? "Guardar Cambios" : "Crear Baremo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
