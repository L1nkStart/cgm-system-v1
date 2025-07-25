"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Procedure {
    name: string
    cost: number
    isActive: boolean
    type: string
}

interface Service {
    name: string
    type: string
    amount: number
    attended: boolean
}

interface AddProcedureToCaseFormProps {
    isOpen: boolean
    onClose: () => void
    onAddProcedures: (newProcedures: Service[]) => void
    baremoId: string | null
    existingServices: Service[]
}

export function AddProcedureToCaseForm({
    isOpen,
    onClose,
    onAddProcedures,
    baremoId,
    existingServices,
}: AddProcedureToCaseFormProps) {
    const [availableProcedures, setAvailableProcedures] = useState<Procedure[]>([])
    const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (isOpen && baremoId) {
            fetchProceduresForBaremo(baremoId)
        } else if (!baremoId) {
            setAvailableProcedures([])
            setSelectedProcedures([])
            setError("No baremo ID provided.")
            setLoading(false)
        }
    }, [isOpen, baremoId])

    const fetchProceduresForBaremo = async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/baremos?id=${id}`)
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()
            if (data && data.procedures) {
                // // Filter out procedures already in existingServices and only show active ones
                // const filteredProcedures = data.procedures.filter(
                //     (p: Procedure) => p.isActive && !existingServices.some((es) => es.name === p.name && es.type === p.type),
                // )
                setAvailableProcedures(data.procedures)
            } else {
                setAvailableProcedures([])
            }
        } catch (err: any) {
            setError(err.message)
            toast({
                title: "Error",
                description: `No se pudieron cargar los procedimientos del baremo: ${err.message}`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCheckboxChange = (procedure: Procedure, checked: boolean) => {
        if (checked) {
            setSelectedProcedures((prev) => [...prev, procedure])
        } else {
            setSelectedProcedures((prev) => prev.filter((p) => p.name !== procedure.name || p.type !== procedure.type))
        }
    }

    const handleAddSelected = () => {
        const newServices: Service[] = selectedProcedures.map((p) => ({
            name: p.name,
            type: p.type,
            amount: p.cost,
            attended: false, // Default to not attended when adding
        }))
        onAddProcedures(newServices)
        onClose()
    }

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Procedimientos</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center">Cargando procedimientos...</div>
                </DialogContent>
            </Dialog>
        )
    }

    if (error) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Procedimientos</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-red-500 text-center">Error: {error}</div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Añadir Procedimientos al Caso</DialogTitle>
                </DialogHeader>
                {!baremoId ? (
                    <div className="py-4 text-center text-muted-foreground">
                        No se ha asignado un baremo a este caso. Por favor, asigne uno primero.
                    </div>
                ) : availableProcedures.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground">
                        No hay procedimientos disponibles o activos en el baremo seleccionado que no estén ya en el caso.
                    </div>
                ) : (
                    <div className="flex-1 pr-4 overflow-y-auto">
                        <div className="grid gap-3 py-4">
                            {availableProcedures.map((procedure, index) => (
                                <div key={index} className="flex items-center space-x-2 border p-3 rounded-md">
                                    <Checkbox
                                        id={`proc-${index}`}
                                        checked={selectedProcedures.some((p) => p.name === procedure.name && p.type === procedure.type)}
                                        onCheckedChange={(checked) => handleCheckboxChange(procedure, checked as boolean)}
                                    />
                                    <Label htmlFor={`proc-${index}`} className="flex-1 cursor-pointer">
                                        <span className="font-medium">{procedure.name}</span> ({procedure.type}) - $
                                        {procedure.cost.toFixed(2)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleAddSelected} disabled={selectedProcedures.length === 0 || !baremoId}>
                        Añadir Seleccionados
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
