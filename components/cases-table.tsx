"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EditCaseForm } from "./edit-case-form"
import { AuditCaseForm } from "./audit-case-form"
import { InvoiceDetails } from "./invoice-details"
import Link from "next/link"

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

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
  assignedAnalystName?: string
  status: string
  doctor?: string
  schedule?: string
  consultory?: string
  results?: string
  auditNotes?: string
  clinicCost?: number
  cgmServiceCost?: number
  totalInvoiceAmount?: number
  invoiceGenerated?: boolean
  // New fields from image
  creatorName?: string
  creatorEmail?: string
  creatorPhone?: string
  patientOtherPhone?: string
  patientFixedPhone?: string
  patientBirthDate?: string
  patientAge?: number
  patientGender?: string
  collective?: string
  diagnosis?: string
  provider?: string // This is the "Proveedor" in the image
  state?: string // Case state
  city?: string
  address?: string
  holderCI?: string
  services?: Service[]
  typeOfRequirement?: string // New field for type of requirement
}

interface CasesTableProps {
  fetchUrl?: string // Make optional, as it might be constructed dynamically
  showAnalystColumn?: boolean
  userRole?: "Analista Concertado" | "Médico Auditor" | "Superusuario" | "Coordinador Regional" | "Jefe Financiero"
  analystId?: string // For analyst-specific dashboard
  statusFilter?: string // For auditor-specific dashboard or cancelled cases
  userAssignedStates?: string[] // New prop: states assigned to the current user
}

export function CasesTable({
  fetchUrl = "/api/cases", // Default fetch URL
  showAnalystColumn = false,
  userRole,
  analystId,
  statusFilter,
  userAssignedStates = [], // Default to empty array
}: CasesTableProps) {
  const [cases, setCases] = useState<CaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isAuditFormOpen, setIsAuditFormOpen] = useState(false)
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null)
  const { toast } = useToast()

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL(fetchUrl, window.location.origin)
      if (analystId) {
        url.searchParams.append("analystId", analystId)
      }
      if (statusFilter) {
        url.searchParams.append("status", statusFilter)
      }
      // Add userAssignedStates to filter if the user is an analyst or auditor
      if ((userRole === "Analista Concertado" || userRole === "Médico Auditor") && userAssignedStates.length > 0) {
        url.searchParams.append("states", userAssignedStates.join(","))
      }

      // Add this line inside the fetchCases function, before the fetch call
      console.log("CasesTable: Fetching cases from URL:", url.toString())
      console.log("CasesTable: userRole:", userRole, "analystId:", analystId, "userAssignedStates:", userAssignedStates)

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error("Failed to fetch cases")
      }
      const data = await response.json()
      setCases(data)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: `No se pudieron cargar los casos: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [fetchUrl, analystId]) // Re-fetch when these props change

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-orange-500 hover:bg-orange-500"
      case "Agendado":
        return "bg-green-500 hover:bg-green-500"
      case "Atendido":
        return "bg-emerald-500 hover:bg-emerald-500"
      case "Priorizado":
        return "bg-blue-500 hover:bg-blue-500"
      case "Remesado":
        return "bg-red-500 hover:bg-red-500"
      case "Anulado":
        return "bg-red-500 hover:bg-red-500" // Changed to red for "Anulado"
      case "Pendiente por Auditar":
        return "bg-yellow-500 hover:bg-yellow-500"
      case "Auditado/Aprobado":
        return "bg-purple-600 hover:bg-purple-600"
      case "Auditado/Rechazado":
        return "bg-red-600 hover:bg-red-600"
      case "Pre-facturado":
        return "bg-indigo-500 hover:bg-indigo-500"
      default:
        return "bg-gray-400 hover:bg-gray-400"
    }
  }

  const handleViewEditClick = (caseData: CaseData) => {
    setSelectedCase(caseData)
    if (userRole === "Analista Concertado") {
      setIsEditFormOpen(true) // Analista puede editar el caso
    } else if (userRole === "Médico Auditor") {
      setIsAuditFormOpen(true) // Médico Auditor puede auditar
    } else if (userRole === "Jefe Financiero" && caseData.status === "Auditado/Aprobado") {
      setIsInvoiceFormOpen(true) // Jefe Financiero puede generar pre-factura
    } else {
      // Para otros roles o estados, navegar a la página de detalles
      window.location.href = `/cases/${caseData.id}`
    }
  }

  const handleSaveEditedCase = async (caseId: string, updates: Partial<CaseData>) => {
    try {
      const response = await fetch(`/api/cases?id=${caseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update case")
      }

      toast({
        title: "Éxito",
        description: "Caso actualizado correctamente.",
      })
      fetchCases() // Refresh the list
      setIsEditFormOpen(false) // Close form after saving
    } catch (err: any) {
      console.error("Error saving edited case:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el caso.",
        variant: "destructive",
      })
    }
  }

  const handleAuditCase = async (caseId: string, newStatus: string, auditNotes?: string) => {
    try {
      const updates: Partial<CaseData> = { status: newStatus }
      if (auditNotes) {
        updates.auditNotes = auditNotes
      }

      const response = await fetch(`/api/cases?id=${caseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to audit case")
      }

      toast({
        title: "Éxito",
        description: `Caso ${newStatus === "Auditado/Aprobado" ? "aprobado" : "rechazado"} por auditoría.`,
      })
      fetchCases() // Refresh the list
      setIsAuditFormOpen(false) // Close form after auditing
    } catch (err: any) {
      console.error("Error auditing case:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo auditar el caso.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateInvoice = async (caseId: string, clinicCost: number, cgmServiceCost: number) => {
    try {
      const totalInvoiceAmount = clinicCost + cgmServiceCost
      const updates: Partial<CaseData> = {
        clinicCost,
        cgmServiceCost,
        totalInvoiceAmount,
        status: "Pre-facturado", // Update status to pre-factured
        invoiceGenerated: true,
      }

      const response = await fetch(`/api/cases?id=${caseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate invoice")
      }

      toast({
        title: "Éxito",
        description: "Pre-factura generada correctamente.",
      })
      fetchCases() // Refresh the list
      setIsInvoiceFormOpen(false) // Close form after generating invoice
    } catch (err: any) {
      console.error("Error generating invoice:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo generar la pre-factura.",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div className="text-center py-8">Cargando casos...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  const stickyColumnWidth = '100px';

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <Input type="date" placeholder="Buscar por fecha" className="w-full sm:max-w-xs" />
        <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto">
          <span className="mr-2">Exportar</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Nro. Siniestro</TableHead>
              <TableHead>ID #</TableHead>
              <TableHead>CI Titular</TableHead>
              <TableHead>CI Paciente</TableHead>
              <TableHead>Nombre Paciente</TableHead>
              <TableHead>Teléfono Paciente</TableHead>
              <TableHead>Tipo de requerimiento</TableHead>
              <TableHead>Estado Caso</TableHead> {/* New column for case state */}
              {showAnalystColumn && <TableHead>Analista Asignado</TableHead>}
              <TableHead>Médico</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Consultorio</TableHead>
              {userRole === "Jefe Financiero" && (
                <>
                  <TableHead>Costo Clínica</TableHead>
                  <TableHead>Costo CGM</TableHead>
                  <TableHead>Total</TableHead>
                </>
              )}
              <TableHead className="sticky right-[100px] z-20 bg-background">Status</TableHead>
              <TableHead className="sticky right-0 z-20 bg-background">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userRole === "Jefe Financiero" ? 19 : showAnalystColumn ? 16 : 15} // Adjusted colspan
                  className="text-center py-4"
                >
                  No hay casos registrados.
                </TableCell>
              </TableRow>
            ) : (
              cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>{caseItem.client}</TableCell>
                  <TableCell>{caseItem.date}</TableCell>
                  <TableCell>{caseItem.sinisterNo}</TableCell>
                  <TableCell>{caseItem.idNumber}</TableCell>
                  <TableCell>{caseItem.ciTitular}</TableCell>
                  <TableCell>{caseItem.ciPatient}</TableCell>
                  <TableCell>{caseItem.patientName}</TableCell>
                  <TableCell>{caseItem.patientPhone}</TableCell>
                  <TableCell>{caseItem.typeOfRequirement || "N/A"}</TableCell>
                  <TableCell>{caseItem.state || "N/A"}</TableCell> {/* Display case state */}
                  {showAnalystColumn && <TableCell>{caseItem.assignedAnalystName}</TableCell>}
                  <TableCell>{caseItem.doctor || "N/A"}</TableCell>
                  <TableCell>{caseItem.schedule || "N/A"}</TableCell>
                  <TableCell>{caseItem.consultory || "N/A"}</TableCell>
                  {userRole === "Jefe Financiero" && (
                    <>
                      <TableCell>${(caseItem.clinicCost || 0).toFixed(2)}</TableCell>
                      <TableCell>${(caseItem.cgmServiceCost || 0).toFixed(2)}</TableCell>
                      <TableCell>${(caseItem.totalInvoiceAmount || 0).toFixed(2)}</TableCell>
                    </>
                  )}
                  {/* Columna del estado (Badge) */}
                  <TableCell className={`sticky right-[${stickyColumnWidth}] min-w-[${stickyColumnWidth}] z-10 bg-background`}>
                    <Badge className={`${getStatusColor(caseItem.status)} text-white`}>{caseItem.status}</Badge>
                  </TableCell>
                  {/* Columna de acciones (Ver botón) */}
                  <TableCell className={`sticky right-0 min-w-[${stickyColumnWidth}] z-10 bg-background`}>
                    <Link href={`/cases/${caseItem.id}`}>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {selectedCase && userRole === "Analista Concertado" && (
        <EditCaseForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onSave={handleSaveEditedCase}
          initialData={selectedCase}
        />
      )}
      {selectedCase && userRole === "Médico Auditor" && (
        <AuditCaseForm
          isOpen={isAuditFormOpen}
          onClose={() => setIsAuditFormOpen(false)}
          onAudit={handleAuditCase}
          initialData={selectedCase}
        />
      )}
      {selectedCase && userRole === "Jefe Financiero" && (
        <InvoiceDetails
          isOpen={isInvoiceFormOpen}
          onClose={() => setIsInvoiceFormOpen(false)}
          onGenerateInvoice={handleGenerateInvoice}
          initialData={selectedCase}
        />
      )}
    </div>
  )
}
