"use client"

import type React from "react"

import { CaseDetailSection } from "@/components/case-detail-section"
import { AttendedServicesTable } from "@/components/attended-services-table"
import { EditCaseForm } from "@/components/edit-case-form"
import { AuditCaseForm } from "@/components/audit-case-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { User, Calendar, Hash, Phone, Mail, UserCog, Tag, Stethoscope, MapPin, Cake, ClipboardList } from "lucide-react"

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
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
}

interface DetailItem {
  icon: React.ReactNode
  label: string
  value: string | number | undefined | null
  link?: string
}

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isAuditFormOpen, setIsAuditFormOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchCaseData()
    fetchUserRole()
  }, [id])

  const fetchCaseData = async () => {
    try {
      const res = await fetch(`/api/cases?id=${id}`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: Case = await res.json()
      setCaseData(data)
    } catch (error) {
      console.error("Error fetching case data:", error)
      setCaseData(null)
    }
  }

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/current-user-role")
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.role)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
      setUserRole(null)
    }
  }

  const handleSave = async () => {
    await fetchCaseData() // Refresh data after save
    setIsEditFormOpen(false)
    setIsAuditFormOpen(false)
  }

  if (!caseData) {
    return <div className="flex items-center justify-center min-h-[60vh]">Cargando detalles del caso...</div>
  }

  const canEdit = userRole === "Superusuario" || userRole === "Coordinador Regional"
  const canAudit = userRole === "Superusuario" || userRole === "Médico Auditor"

  // Function to prepare general case details
  const getGeneralDetails = (data: Case): DetailItem[] => [
    { icon: <User className="h-4 w-4" />, label: "Cliente", value: data.client },
    { icon: <Calendar className="h-4 w-4" />, label: "Fecha", value: data.date },
    { icon: <Hash className="h-4 w-4" />, label: "Nro. Siniestro", value: data.sinisterNo },
    { icon: <Hash className="h-4 w-4" />, label: "ID #", value: data.idNumber },
    { icon: <Hash className="h-4 w-4" />, label: "CI Titular", value: data.ciTitular },
    { icon: <Hash className="h-4 w-4" />, label: "CI Paciente", value: data.ciPatient },
    { icon: <User className="h-4 w-4" />, label: "Nombre Paciente", value: data.patientName },
    { icon: <Phone className="h-4 w-4" />, label: "Teléfono Paciente", value: data.patientPhone },
    { icon: <UserCog className="h-4 w-4" />, label: "Analista Asignado", value: data.assignedAnalystName },
    { icon: <Tag className="h-4 w-4" />, label: "Estado", value: data.status },
    { icon: <ClipboardList className="h-4 w-4" />, label: "Tipo de Requerimiento", value: data.typeOfRequirement },
  ]

  // Function to prepare additional patient/creator details
  const getAdditionalDetails = (data: Case): DetailItem[] => [
    { icon: <User className="h-4 w-4" />, label: "Creador del Caso", value: data.creatorName },
    { icon: <Mail className="h-4 w-4" />, label: "Email Creador", value: data.creatorEmail },
    { icon: <Phone className="h-4 w-4" />, label: "Teléfono Creador", value: data.creatorPhone },
    { icon: <Phone className="h-4 w-4" />, label: "Otro Teléfono Paciente", value: data.patientOtherPhone },
    { icon: <Phone className="h-4 w-4" />, label: "Teléfono Fijo Paciente", value: data.patientFixedPhone },
    { icon: <Calendar className="h-4 w-4" />, label: "Fecha Nac. Paciente", value: data.patientBirthDate },
    { icon: <Cake className="h-4 w-4" />, label: "Edad Paciente", value: data.patientAge },
    { icon: <User className="h-4 w-4" />, label: "Género Paciente", value: data.patientGender },
    { icon: <Tag className="h-4 w-4" />, label: "Colectivo", value: data.collective },
    { icon: <Stethoscope className="h-4 w-4" />, label: "Diagnóstico", value: data.diagnosis },
    { icon: <Tag className="h-4 w-4" />, label: "Proveedor", value: data.provider },
    { icon: <MapPin className="h-4 w-4" />, label: "Estado", value: data.state },
    { icon: <MapPin className="h-4 w-4" />, label: "Ciudad", value: data.city },
    { icon: <MapPin className="h-4 w-4" />, label: "Dirección", value: data.address },
    { icon: <Hash className="h-4 w-4" />, label: "CI Tomador", value: data.holderCI },
  ]

  // Function to prepare appointment details
  const getAppointmentDetails = (data: Case): DetailItem[] => [
    { icon: <Stethoscope className="h-4 w-4" />, label: "Médico", value: data.doctor },
    { icon: <Calendar className="h-4 w-4" />, label: "Horario", value: data.schedule },
    { icon: <MapPin className="h-4 w-4" />, label: "Consultorio", value: data.consultory },
  ]

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Detalles del Caso: {caseData.patientName}</h1>
        <div className="flex gap-2">
          {canEdit && (
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Editar Caso</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Editar Detalles del Caso</DialogTitle>
                </DialogHeader>
                {/* Pass initialData and onSave directly to EditCaseForm */}
                <EditCaseForm
                  isOpen={isEditFormOpen}
                  onClose={() => setIsEditFormOpen(false)}
                  onSave={(caseId, updates) => {
                    // This logic should be handled by the form itself or a dedicated action
                    // For now, we'll just refresh data and close
                    fetchCaseData()
                    setIsEditFormOpen(false)
                  }}
                  initialData={caseData}
                />
              </DialogContent>
            </Dialog>
          )}
          {canAudit && (caseData.status === "Pendiente por Auditar" || caseData.status === "Auditado/Aprobado") && (
            <Dialog open={isAuditFormOpen} onOpenChange={setIsAuditFormOpen}>
              <DialogTrigger asChild>
                <Button>Auditar Caso</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Auditar Caso</DialogTitle>
                </DialogHeader>
                {/* Pass initialData and onAudit directly to AuditCaseForm */}
                <AuditCaseForm
                  isOpen={isAuditFormOpen}
                  onClose={() => setIsAuditFormOpen(false)}
                  onAudit={(caseId, newStatus, auditNotes) => {
                    // This logic should be handled by the form itself or a dedicated action
                    // For now, we'll just refresh data and close
                    fetchCaseData()
                    setIsAuditFormOpen(false)
                  }}
                  initialData={caseData}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="services">Servicios Atendidos</TabsTrigger>
          <TabsTrigger value="audit">Auditoría y Resultados</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="grid gap-4">
            <CaseDetailSection title="Datos Básicos del Caso" details={getGeneralDetails(caseData)} />
            <CaseDetailSection title="Datos de la Cita" details={getAppointmentDetails(caseData)} />
            <CaseDetailSection title="Información Adicional" details={getAdditionalDetails(caseData)} />
          </div>
        </TabsContent>
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Atendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {/* AttendedServicesTable needs caseId, services, onUpdateServices, onAddRequirement */}
              <AttendedServicesTable
                services={caseData.services || []}
                onUpdateServices={(updatedServices) => {
                  // This would typically trigger a PUT request to update services
                  console.log("Updated services:", updatedServices)
                  // For now, just update local state if needed, or refetch
                  // setCaseData(prev => prev ? { ...prev, services: updatedServices } : null);
                }}
                onAddRequirement={() => {
                  console.log("Add requirement clicked")
                  // Logic to add a new requirement
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
            <CardContent className="grid gap-4">
              <div>
                <h3 className="font-semibold">Estado del Caso:</h3>
                <p>{caseData.status}</p>
              </div>
              <div>
                <h3 className="font-semibold">Notas de Auditoría:</h3>
                <p>{caseData.auditNotes || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Resultados:</h3>
                <p>{caseData.results || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Costo Clínica:</h3>
                <p>${caseData.clinicCost?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Costo Servicio CGM:</h3>
                <p>${caseData.cgmServiceCost?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Monto Total Factura:</h3>
                <p>${caseData.totalInvoiceAmount?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Factura Generada:</h3>
                <p>{caseData.invoiceGenerated ? "Sí" : "No"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
