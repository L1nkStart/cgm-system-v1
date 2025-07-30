"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CaseDetailSection } from "@/components/case-detail-section"
import { EditCaseForm } from "@/components/edit-case-form"
import { AuditCaseForm } from "@/components/audit-case-form"
import { AddProcedureToCaseForm } from "@/components/add-procedure-to-case-form"
import { AttendedServicesTable } from "@/components/attended-services-table"
import { ScheduleAppointmentForm } from "@/components/schedule-appointment-form"
import { PreInvoiceDialog } from "@/components/pre-invoice-dialog"
import { DocumentUploadForm } from "@/components/document-upload-form" // Import the new component
import { Download, FileText } from "lucide-react"
import { PreInvoiceUploadForm } from "@/components/pre-invoice-upload-form"

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface Document {
  name: string
  url: string
  type?: string
  size?: number
}

interface Case {
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
  provider?: string
  state?: string
  city?: string
  address?: string
  holderCI?: string
  services?: Service[]
  typeOfRequirement?: string
  baremoId?: string
  baremoName?: string
  documents?: Document[]
  preInvoiceDocuments?: Document[]
}

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isAuditFormOpen, setIsAuditFormOpen] = useState(false)
  const [isAddProcedureFormOpen, setIsAddProcedureFormOpen] = useState(false)
  const [isScheduleAppointmentFormOpen, setIsScheduleAppointmentFormOpen] = useState(false)
  const [isPreInvoiceDialogOpen, setIsPreInvoiceDialogOpen] = useState(false)
  const [isDocumentUploadFormOpen, setIsDocumentUploadFormOpen] = useState(false)
  const [isPreInvoiceUploadFormOpen, setIsPreInvoiceUploadFormOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchCaseData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/cases?id=${id}`)
      if (!response.ok) {
        if (response.status === 403) {
          setError("No tienes permiso para ver este caso.")
        } else {
          throw new Error(`Failed to fetch case: ${response.statusText}`)
        }
      }
      const data = await response.json()
      setCaseData(data)
      console.log(data)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      toast({
        title: "Error",
        description: err.message || "Failed to load case details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/current-user-role")
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role || null)
        setUserId(data.userId || null) // Set userId here
      } else {
        console.error("Failed to fetch user role:", response.statusText)
        setUserRole(null)
        setUserId(null)
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
      setUserRole(null)
      setUserId(null)
    }
  }

  useEffect(() => {
    fetchCaseData()
    fetchUserRole()
  }, [id])

  const handleUpdateCase = async (updatedFields: Partial<Case>) => {
    try {
      const response = await fetch(`/api/cases?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update case.")
      }

      const updatedCase = await response.json()
      setCaseData(updatedCase)
      toast({
        title: "Éxito",
        description: `Caso ${id} actualizado correctamente.`,
        variant: "success",
      })
      setIsEditFormOpen(false)
      setIsAuditFormOpen(false)
      setIsAddProcedureFormOpen(false)
      setIsScheduleAppointmentFormOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || `Failed to update case ${id}.`,
        variant: "destructive",
      })
    }
  }

  const handleSaveDocuments = async (caseId: string, documents: Document[]) => {
    try {
      await handleUpdateCase({ documents: documents })
      toast({
        title: "Éxito",
        description: `Documentos del caso ${id} actualizados correctamente.`,
        variant: "success",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Error al guardar los documentos en el caso ${id}.`,
        variant: "destructive",
      })
    }
  }

  const handleSaveEditedCase = async (caseId: string, updates: Partial<Case>) => {
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
        description: `Caso ${id} actualizado correctamente.`,
      })
      fetchCaseData() // Refresh the list
      setIsEditFormOpen(false)
    } catch (err: any) {
      console.error("Error saving edited case:", err)
      toast({
        title: "Error",
        description: err.message || `No se pudo actualizar el caso ${id}.`,
        variant: "destructive",
      })
    }
  }
  const handleAuditCase = async (caseId: string, newStatus: string, auditNotes?: string) => {
    try {
      const updates: Partial<Case> = { status: newStatus }
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
        description: `Caso ${id} ha sido ${newStatus === "Auditado/Aprobado" ? "aprobado" : "rechazado"} por auditoría.`,
      })
      fetchCaseData() // Refresh the list
      setIsAuditFormOpen(false)
    } catch (err: any) {
      console.error("Error auditing case:", err)
      toast({
        title: "Error",
        description: err.message || `No se pudo auditar el caso ${id}.`,
        variant: "destructive",
      })
    }
  }

  const handleSavePreInvoiceDocuments = async (caseId: string, documents: Document[]) => {
    try {
      await handleUpdateCase({ preInvoiceDocuments: documents })
      toast({
        title: "Éxito",
        description: "Prefacturas del caso actualizadas correctamente.",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar las prefacturas en el caso.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando caso...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  if (!caseData) {
    return <div className="flex justify-center items-center h-screen">Caso no encontrado.</div>
  }

  const isAnalystConcertado = userRole === "Analista Concertado"
  const isMedicoAuditor = userRole === "Médico Auditor"
  const isSuperusuario = userRole === "Superusuario"
  const isCoordinadorRegional = userRole === "Coordinador Regional" // Keep this for other checks if needed

  const canEditCase = isSuperusuario || isCoordinadorRegional
  const canAuditCase = isMedicoAuditor
  const canAddProcedure = isAnalystConcertado || isSuperusuario || isCoordinadorRegional
  const canScheduleAppointment = isAnalystConcertado || isSuperusuario || isCoordinadorRegional
  const canGeneratePreInvoiceGlobally = isSuperusuario || isCoordinadorRegional // Keep this for other uses if needed
  const hasProcedures = caseData.services ? true : false
  console.log(caseData.services, hasProcedures, "PP")

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Detalles del Caso: {caseData.patientName}</h1>
        <div className="ml-auto flex gap-2">
          {canEditCase && (
            <Button onClick={() => setIsEditFormOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              Editar Caso
            </Button>
          )}
          {canAuditCase && (
            <Button onClick={() => setIsAuditFormOpen(true)} className="bg-purple-500 hover:bg-purple-600 text-white">
              Auditar Caso
            </Button>
          )}
          {canScheduleAppointment && caseData.status === "Pendiente" && (
            <Button
              onClick={() => setIsScheduleAppointmentFormOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={!hasProcedures}
            >
              Agendar Cita
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="services">Servicios Atendidos</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger> {/* New tab for documents */}
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Información General del Caso - <span className="text-cyan-500">{caseData.status}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <CaseDetailSection caseData={caseData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Atendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendedServicesTable
                services={caseData.services || []}
                baremoId={caseData.baremoId || null}
                caseId={caseData.id}
                onUpdateServices={(updatedServices) => {
                  setCaseData((prev) => (prev ? { ...prev, services: updatedServices } : null))
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Notas de Auditoría y Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold">Resultados:</h3>
                    <p className="text-muted-foreground">{caseData.results || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Notas de Auditoría:</h3>
                    <p className="text-muted-foreground">{caseData.auditNotes || "N/A"}</p>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Informes Médicos y Resultados de Exámenes
                    </h3>
                    {caseData.documents && caseData.documents.length > 0 ? (
                      <div className="grid gap-2">
                        {caseData.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                {doc.size && (
                                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-orange-50 hover:border-orange-200 bg-transparent"
                            >
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Ver/Descargar
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm bg-muted/30 p-3 rounded-lg">
                        No hay informes médicos ni resultados de exámenes subidos para este caso.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      Prefacturas
                    </h3>
                    {caseData.preInvoiceDocuments && caseData.preInvoiceDocuments.length > 0 ? (
                      <div className="grid gap-2">
                        {caseData.preInvoiceDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-indigo-600" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                {doc.size && (
                                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-indigo-50 hover:border-indigo-200 bg-transparent"
                            >
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Ver/Descargar
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm bg-muted/30 p-3 rounded-lg">
                        No hay prefacturas subidas para este caso.
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  {(isSuperusuario || (isAnalystConcertado && caseData.assignedAnalystId === userId)) && (
                    <Button
                      onClick={() => setIsDocumentUploadFormOpen(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Subir informe medico y resultados
                    </Button>
                  )}
                  {(isSuperusuario || isCoordinadorRegional) && (
                    <Button
                      onClick={() => setIsPreInvoiceUploadFormOpen(true)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      Subir prefactura
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos del Caso</CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.documents && caseData.documents.length > 0 ? (
                <ul className="space-y-2">
                  {caseData.documents.map((doc, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No hay documentos subidos para este caso.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial del Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidad de historial aún no implementada.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isEditFormOpen && caseData && (
          <EditCaseForm
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            onSave={handleSaveEditedCase}
            initialData={caseData}
          />
        )}

        {isAuditFormOpen && caseData && (
          <AuditCaseForm
            isOpen={isAuditFormOpen}
            onClose={() => setIsAuditFormOpen(false)}
            onAudit={handleAuditCase}
            initialData={caseData}
          />
        )}

        {isAddProcedureFormOpen && caseData && (
          <AddProcedureToCaseForm
            isOpen={isAddProcedureFormOpen}
            onClose={() => setIsAddProcedureFormOpen(false)}
            onSave={handleUpdateCase}
            caseId={caseData.id}
            currentServices={caseData.services || []}
            baremoId={caseData.baremoId || ""}
          />
        )}

        {isScheduleAppointmentFormOpen && caseData && (
          <ScheduleAppointmentForm
            isOpen={isScheduleAppointmentFormOpen}
            onClose={() => setIsScheduleAppointmentFormOpen(false)}
            onSave={(caseId, updates) => handleUpdateCase(updates)}
            initialData={caseData}
          />
        )}

        {isPreInvoiceDialogOpen && caseData && (
          <DocumentUploadForm
            isOpen={isPreInvoiceDialogOpen}
            onClose={() => setIsPreInvoiceDialogOpen(false)}
            caseId={caseData.id}
            onSave={handleSaveDocuments}
            initialDocuments={caseData.documents || []}
          />
        )}

        {isDocumentUploadFormOpen && caseData && (
          <DocumentUploadForm
            isOpen={isDocumentUploadFormOpen}
            onClose={() => setIsDocumentUploadFormOpen(false)}
            onSave={handleSaveDocuments}
            caseId={caseData.id}
            initialDocuments={caseData.documents || []}
            uploadType="medical-results"
            title="Subir Informe Médico y Resultados"
          />
        )}

        {isPreInvoiceUploadFormOpen && caseData && (
          <PreInvoiceUploadForm
            isOpen={isPreInvoiceUploadFormOpen}
            onClose={() => setIsPreInvoiceUploadFormOpen(false)}
            onSave={handleSavePreInvoiceDocuments}
            caseId={caseData.id}
            initialDocuments={caseData.preInvoiceDocuments || []}
          />
        )}
      </Tabs>
    </main>
  )
}