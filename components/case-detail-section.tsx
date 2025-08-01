import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Info,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  FileText,
  Stethoscope,
  Clock,
  Building,
  Wallet,
  CheckCircle,
  UserPlus,
  Hash,
  CalendarDays,
  Heart,
  Home,
  Briefcase,
  BookOpen,
  Users,
} from "lucide-react"

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface CaseDetailSectionProps {
  caseData: {
    client: string
    date: string
    sinisterNo?: string
    idNumber?: string
    ciTitular?: string
    ciPatient: string
    patientName: string
    patientPhone: string
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
    baremoName?: string
    clientName?: string
  }
}

export function CaseDetailSection({ caseData }: CaseDetailSectionProps) {
  const caseDetails = [
    { icon: <User />, label: "Cliente", value: caseData.clientName },
    { icon: <CalendarDays />, label: "Fecha", value: caseData.date },
    { icon: <Hash />, label: "N° Siniestro", value: caseData.sinisterNo || "N/A" },
    { icon: <FileText />, label: "N° Identificación", value: caseData.idNumber || "N/A" },
    { icon: <User />, label: "C.I. Titular", value: caseData.ciTitular || "N/A" },
    { icon: <ClipboardList />, label: "Tipo de Requerimiento", value: caseData.typeOfRequirement || "N/A" },
    { icon: <Info />, label: "Estado del Caso", value: caseData.status },
    { icon: <Briefcase />, label: "Analista Asignado", value: caseData.assignedAnalystName || "N/A" },
    { icon: <BookOpen />, label: "Baremo Asignado", value: caseData.baremoName || "N/A" },
    { icon: <Building />, label: "Proveedor", value: caseData.provider || "N/A" },
    { icon: <Users />, label: "Colectivo", value: caseData.collective || "N/A" },
    { icon: <Stethoscope />, label: "Diagnóstico", value: caseData.diagnosis || "N/A" },
  ].filter((item) => item.value !== "N/A")

  const patientDetails = [
    { icon: <User />, label: "Nombre Paciente", value: caseData.patientName },
    { icon: <FileText />, label: "C.I. Paciente", value: caseData.ciPatient },
    { icon: <Phone />, label: "Teléfono Paciente", value: caseData.patientPhone },
    { icon: <Phone />, label: "Otro Teléfono", value: caseData.patientOtherPhone || "N/A" },
    { icon: <Phone />, label: "Teléfono Fijo", value: caseData.patientFixedPhone || "N/A" },
    { icon: <Calendar />, label: "Fecha Nacimiento", value: caseData.patientBirthDate || "N/A" },
    { icon: <Info />, label: "Edad", value: caseData.patientAge?.toString() || "N/A" },
    { icon: <Heart />, label: "Género", value: caseData.patientGender || "N/A" },
    { icon: <MapPin />, label: "Estado", value: caseData.state || "N/A" },
    { icon: <MapPin />, label: "Ciudad", value: caseData.city || "N/A" },
    { icon: <Home />, label: "Dirección", value: caseData.address || "N/A" },
    { icon: <User />, label: "C.I. Titular (Paciente)", value: caseData.holderCI || "N/A" },
  ].filter((item) => item.value !== "N/A")

  const appointmentDetails = [
    { icon: <Stethoscope />, label: "Doctor", value: caseData.doctor || "N/A" },
    { icon: <Clock />, label: "Horario", value: caseData.schedule || "N/A" },
    { icon: <Building />, label: "Consultorio", value: caseData.consultory || "N/A" },
    { icon: <Calendar />, label: "Fecha", value: caseData.date || "N/A" },

  ].filter((item) => item.value !== "N/A")

  const costDetails = [
    { icon: <DollarSign />, label: "Costo Clínico", value: `$${caseData.clinicCost?.toFixed(2) || "0.00"}` },
    { icon: <DollarSign />, label: "Costo Servicio CGM", value: `$${caseData.cgmServiceCost?.toFixed(2) || "0.00"}` },
    { icon: <Wallet />, label: "Monto Total Factura", value: `$${caseData.totalInvoiceAmount?.toFixed(2) || "0.00"}` },
    { icon: <CheckCircle />, label: "Factura Generada", value: caseData.invoiceGenerated ? "Sí" : "No" },
  ]

  const creatorDetails = [
    { icon: <UserPlus />, label: "Nombre", value: caseData.creatorName || "N/A" },
    { icon: <Mail />, label: "Email", value: caseData.creatorEmail || "N/A" },
    { icon: <Phone />, label: "Teléfono", value: caseData.creatorPhone || "N/A" },
  ].filter((item) => item.value !== "N/A")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Caso </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {caseDetails.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400 mt-0.5">{item.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {patientDetails.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400 mt-0.5">{item.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {(caseData.doctor || caseData.schedule || caseData.consultory) && appointmentDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Información de Cita</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {appointmentDetails.map((item, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400 mt-0.5">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Costos y Facturación</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {costDetails.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400 mt-0.5">{item.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Creador</CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {creatorDetails.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400 mt-0.5">{item.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}:</span>
                <span>{item.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
