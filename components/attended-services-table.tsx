"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AddProcedureToCaseForm } from "./add-procedure-to-case-form" // Import the new component

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface AttendedServicesTableProps {
  services: Service[]
  onUpdateServices?: (services: Service[]) => void
  baremoId: string | null // New prop: baremoId of the current case
  caseId: string // New prop: caseId to update services
}

export function AttendedServicesTable({
  services: initialServices,
  onUpdateServices,
  baremoId, // Destructure new prop
  caseId, // Destructure new prop
}: AttendedServicesTableProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [isAddProcedureFormOpen, setIsAddProcedureFormOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setServices(initialServices) // Update local state when initialServices prop changes
  }, [initialServices])

  const handleCheckboxChange = async (index: number, checked: boolean) => {
    const newServices = [...services]
    newServices[index].attended = checked
    setServices(newServices)
    if (onUpdateServices) {
      onUpdateServices(newServices) // Notify parent of change
    }

    // Optionally, persist this change to the database immediately
    try {
      const response = await fetch(`/api/cases?id=${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: newServices }),
      })
      if (!response.ok) {
        throw new Error("Failed to update service status")
      }
      toast({ title: "Éxito", description: "Estado del servicio actualizado." })
    } catch (error: any) {
      console.error("Error updating service status:", error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado del servicio: ${error.message}`,
        variant: "destructive",
      })
      // Revert local state if update fails
      setServices(initialServices)
    }
  }

  const handleAddProcedures = async (newProcedures: Service[]) => {
    const combinedServices = [...services, ...newProcedures]
    setServices(combinedServices) // Update local state immediately
    if (onUpdateServices) {
      onUpdateServices(combinedServices) // Notify parent
    }

    // Persist the new services to the database
    try {
      const response = await fetch(`/api/cases?id=${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: combinedServices }),
      })
      if (!response.ok) {
        throw new Error("Failed to add procedures to case")
      }
      toast({ title: "Éxito", description: "Procedimientos añadidos al caso." })
    } catch (error: any) {
      console.error("Error adding procedures:", error)
      toast({
        title: "Error",
        description: `No se pudieron añadir los procedimientos: ${error.message}`,
        variant: "destructive",
      })
      // Revert local state if update fails
      setServices(initialServices)
    }
  }

  const handleDownloadCommitment = () => {
    toast({
      title: "Descarga de Compromiso",
      description: "Funcionalidad de descarga de compromiso no implementada.",
      variant: "default",
    })
    // Logic to generate and download the commitment document
  }

  return (
    <div className="border-l-4 border-red-500 rounded-lg shadow-sm">
      <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Tilda los servicios atendidos y descarga el compromiso
        </h3>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setIsAddProcedureFormOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!baremoId} // Deshabilitar si no hay baremo asignado
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Añadir Procedimiento
          </Button>
          <Button variant="outline" onClick={handleDownloadCommitment}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Compromiso
          </Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Tipo de servicio</TableHead>
                <TableHead>Monto (Bs.)</TableHead>
                <TableHead className="text-center">¿Atendido?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No hay servicios registrados para este caso.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.type}</TableCell>
                    <TableCell>{service.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={service.attended}
                        onCheckedChange={(checked) => handleCheckboxChange(index, checked as boolean)}
                        aria-label={`Marcar ${service.name} como atendido`}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AddProcedureToCaseForm
        isOpen={isAddProcedureFormOpen}
        onClose={() => setIsAddProcedureFormOpen(false)}
        onAddProcedures={handleAddProcedures}
        baremoId={baremoId}
        existingServices={services}
      />
    </div>
  )
}
