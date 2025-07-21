"use client"

import CaseDetailSection from "@/components/case-detail-section"
import AttendedServicesTable from "@/components/attended-services-table"
import EditCaseForm from "@/components/edit-case-form"
import AuditCaseForm from "@/components/audit-case-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"

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
                <EditCaseForm caseData={caseData} onSave={handleSave} />
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
                <AuditCaseForm caseData={caseData} onSave={handleSave} />
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
          <Card>
            <CardHeader>
              <CardTitle>Datos del Caso</CardTitle>
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
              <AttendedServicesTable caseId={caseData.id} services={caseData.services || []} onSave={fetchCaseData} />
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
                <p>{caseData.clinicCost?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Costo Servicio CGM:</h3>
                <p>{caseData.cgmServiceCost?.toFixed(2) || "0.00"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Monto Total Factura:</h3>
                <p>{caseData.totalInvoiceAmount?.toFixed(2) || "0.00"}</p>
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
