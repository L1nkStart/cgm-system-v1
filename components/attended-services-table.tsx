"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface AttendedServicesTableProps {
  services: Service[]
  onUpdateServices?: (services: Service[]) => void
  onAddRequirement?: () => void
}

export function AttendedServicesTable({
  services: initialServices,
  onUpdateServices,
  onAddRequirement,
}: AttendedServicesTableProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const { toast } = useToast()

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newServices = [...services]
    newServices[index].attended = checked
    setServices(newServices)
    if (onUpdateServices) {
      onUpdateServices(newServices)
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
          <Button onClick={onAddRequirement} className="bg-blue-500 hover:bg-blue-600 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Agregar requerimiento
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
    </div>
  )
}
