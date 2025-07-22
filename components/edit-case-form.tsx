"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Analyst {
  id: string
  email: string
  name: string
  role: string
  assignedStates?: string[] // New: assigned states for the analyst
}

interface Baremo {
  id: string
  name: string
  clinicName: string
  effectiveDate: string
  procedures: Procedure[]
}

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
}

interface EditCaseFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (caseId: string, updates: Partial<CaseData>) => void
  initialData: CaseData | null
}

export function EditCaseForm({ isOpen, onClose, onSave, initialData }: EditCaseFormProps) {
  const [client, setClient] = useState(initialData?.client || "")
  const [date, setDate] = useState(initialData?.date || "")
  const [patientName, setPatientName] = useState(initialData?.patientName || "")
  const [ciPatient, setCiPatient] = useState(initialData?.ciPatient || "")
  const [patientPhone, setPatientPhone] = useState(initialData?.patientPhone || "")
  const [assignedAnalystId, setAssignedAnalystId] = useState(initialData?.assignedAnalystId || "")
  const [analysts, setAnalysts] = useState<Analyst[]>([])

  const [ciTitular, setCiTitular] = useState(initialData?.ciTitular || "")
  const [patientOtherPhone, setPatientOtherPhone] = useState(initialData?.patientOtherPhone || "")
  const [patientFixedPhone, setPatientFixedPhone] = useState(initialData?.patientFixedPhone || "")
  const [patientBirthDate, setPatientBirthDate] = useState(initialData?.patientBirthDate || "")
  const [patientAge, setPatientAge] = useState<number | string>(initialData?.patientAge || "")
  const [patientGender, setPatientGender] = useState(initialData?.patientGender || "")
  const [collective, setCollective] = useState(initialData?.collective || "")
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || "")
  const [provider, setProvider] = useState(initialData?.provider || "")
  const [state, setState] = useState(initialData?.state || "") // Estado para el estado de Venezuela
  const [city, setCity] = useState(initialData?.city || "")
  const [address, setAddress] = useState(initialData?.address || "")
  const [holderCI, setHolderCI] = useState(initialData?.holderCI || "")
  const [typeOfRequirement, setTypeOfRequirement] = useState(initialData?.typeOfRequirement || "")
  const [baremoId, setBaremoId] = useState(initialData?.baremoId || "")
  const [baremos, setBaremos] = useState<Baremo[]>([])

  const [doctor, setDoctor] = useState(initialData?.doctor || "")
  const [schedule, setSchedule] = useState(initialData?.schedule || "")
  const [consultory, setConsultory] = useState(initialData?.consultory || "")
  const [results, setResults] = useState(initialData?.results || "")
  const [status, setStatus] = useState(initialData?.status || "Pendiente")
  const { toast } = useToast()

  useEffect(() => {
    if (initialData) {
      setClient(initialData.client || "")
      setDate(initialData.date || "")
      setPatientName(initialData.patientName || "")
      setCiPatient(initialData.ciPatient || "")
      setPatientPhone(initialData.patientPhone || "")
      setAssignedAnalystId(initialData.assignedAnalystId || "")
      setCiTitular(initialData.ciTitular || "")
      setPatientOtherPhone(initialData.patientOtherPhone || "")
      setPatientFixedPhone(initialData.patientFixedPhone || "")
      setPatientBirthDate(initialData.patientBirthDate || "")
      setPatientAge(initialData.patientAge || "")
      setPatientGender(initialData.patientGender || "")
      setCollective(initialData.collective || "")
      setDiagnosis(initialData.diagnosis || "")
      setProvider(initialData.provider || "")
      setState(initialData.state || "")
      setCity(initialData.city || "")
      setAddress(initialData.address || "")
      setHolderCI(initialData.holderCI || "")
      setTypeOfRequirement(initialData.typeOfRequirement || "")
      setBaremoId(initialData.baremoId || "")

      setDoctor(initialData.doctor || "")
      setSchedule(initialData.schedule || "")
      setConsultory(initialData.consultory || "")
      setResults(initialData.results || "")
      setStatus(initialData.status || "Pendiente")
    }
    fetchAnalysts()
    fetchBaremos()
  }, [initialData])

  const fetchAnalysts = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch analysts")
      }
      const data: Analyst[] = await response.json()
      setAnalysts(data.filter((user) => user.role === "Analista Concertado"))
    } catch (error) {
      console.error("Error fetching analysts:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los analistas.",
        variant: "destructive",
      })
    }
  }

  const fetchBaremos = async () => {
    try {
      const response = await fetch("/api/baremos")
      if (!response.ok) {
        throw new Error("Failed to fetch baremos")
      }
      const data: Baremo[] = await response.json()
      setBaremos(data)
    } catch (error) {
      console.error("Error fetching baremos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los baremos.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!initialData) return

    const currentValues = {
      client,
      date,
      patientName,
      ciPatient,
      patientPhone,
      assignedAnalystId,
      ciTitular,
      patientOtherPhone,
      patientFixedPhone,
      patientBirthDate,
      patientAge,
      patientGender,
      collective,
      diagnosis,
      provider,
      state,
      city,
      address,
      holderCI,
      typeOfRequirement,
      baremoId,
      doctor,
      schedule,
      consultory,
      results,
      status,
    }

    const updates: Partial<CaseData> = {}
    let hasChanges = false

    // Compare each field with initialData and add to updates if changed
    // Note: patientAge and dates need special handling for comparison due to type conversions or empty strings
    if (currentValues.client !== initialData.client) {
      updates.client = currentValues.client
      hasChanges = true
    }
    if (currentValues.date !== initialData.date) {
      updates.date = currentValues.date
      hasChanges = true
    }
    if (currentValues.patientName !== initialData.patientName) {
      updates.patientName = currentValues.patientName
      hasChanges = true
    }
    if (currentValues.ciPatient !== initialData.ciPatient) {
      updates.ciPatient = currentValues.ciPatient
      hasChanges = true
    }
    if (currentValues.patientPhone !== initialData.patientPhone) {
      updates.patientPhone = currentValues.patientPhone
      hasChanges = true
    }
    if (currentValues.assignedAnalystId !== initialData.assignedAnalystId) {
      updates.assignedAnalystId = currentValues.assignedAnalystId
      hasChanges = true
    }
    if (currentValues.ciTitular !== initialData.ciTitular) {
      updates.ciTitular = currentValues.ciTitular
      hasChanges = true
    }
    if (currentValues.patientOtherPhone !== initialData.patientOtherPhone) {
      updates.patientOtherPhone = currentValues.patientOtherPhone
      hasChanges = true
    }
    if (currentValues.patientFixedPhone !== initialData.patientFixedPhone) {
      updates.patientFixedPhone = currentValues.patientFixedPhone
      hasChanges = true
    }

    // Handle patientBirthDate (string vs null)
    const initialBirthDate = initialData.patientBirthDate || ""
    const currentBirthDate = currentValues.patientBirthDate || ""
    if (initialBirthDate !== currentBirthDate) {
      updates.patientBirthDate = currentBirthDate || null
      hasChanges = true
    }

    // Handle patientAge (number vs string/null)
    const initialAge = initialData.patientAge === null ? "" : initialData.patientAge
    const currentAge = currentValues.patientAge === null ? "" : currentValues.patientAge
    if (String(initialAge) !== String(currentAge)) {
      updates.patientAge = currentValues.patientAge ? Number(currentValues.patientAge) : null
      hasChanges = true
    }

    if (currentValues.patientGender !== initialData.patientGender) {
      updates.patientGender = currentValues.patientGender
      hasChanges = true
    }
    if (currentValues.collective !== initialData.collective) {
      updates.collective = currentValues.collective
      hasChanges = true
    }
    if (currentValues.diagnosis !== initialData.diagnosis) {
      updates.diagnosis = currentValues.diagnosis
      hasChanges = true
    }
    if (currentValues.provider !== initialData.provider) {
      updates.provider = currentValues.provider
      hasChanges = true
    }
    if (currentValues.state !== initialData.state) {
      updates.state = currentValues.state
      hasChanges = true
    }
    if (currentValues.city !== initialData.city) {
      updates.city = currentValues.city
      hasChanges = true
    }
    if (currentValues.address !== initialData.address) {
      updates.address = currentValues.address
      hasChanges = true
    }
    if (currentValues.holderCI !== initialData.holderCI) {
      updates.holderCI = currentValues.holderCI
      hasChanges = true
    }
    if (currentValues.typeOfRequirement !== initialData.typeOfRequirement) {
      updates.typeOfRequirement = currentValues.typeOfRequirement
      hasChanges = true
    }
    if (currentValues.baremoId !== initialData.baremoId) {
      updates.baremoId = currentValues.baremoId
      hasChanges = true
    }
    if (currentValues.doctor !== initialData.doctor) {
      updates.doctor = currentValues.doctor
      hasChanges = true
    }
    if (currentValues.schedule !== initialData.schedule) {
      updates.schedule = currentValues.schedule
      hasChanges = true
    }
    if (currentValues.consultory !== initialData.consultory) {
      updates.consultory = currentValues.consultory
      hasChanges = true
    }
    if (currentValues.results !== initialData.results) {
      updates.results = currentValues.results
      hasChanges = true
    }

    // Special logic for status change based on results
    let finalStatus = currentValues.status
    if (
      currentValues.results &&
      currentValues.status !== "Pendiente por Auditar" &&
      currentValues.status !== "Auditado/Aprobado"
    ) {
      finalStatus = "Pendiente por Auditar"
    }
    if (finalStatus !== initialData.status) {
      updates.status = finalStatus
      hasChanges = true
    }

    if (!hasChanges) {
      toast({
        title: "Información",
        description: "No se detectaron cambios para guardar.",
        variant: "default",
      })
      onClose()
      return
    }

    onSave(initialData.id, updates)
    onClose()
  }

  const statusOptions = [
    "Pendiente",
    "Agendado",
    "Atendido",
    "Remesado",
    "Priorizado",
    "Anulado",
    "Pendiente por Auditar",
    "Auditado/Aprobado",
    "Auditado/Rechazado",
    "Pre-facturado",
  ]

  const venezuelanStates = [
    "Amazonas",
    "Anzoátegui",
    "Apure",
    "Aragua",
    "Barinas",
    "Bolívar",
    "Carabobo",
    "Cojedes",
    "Delta Amacuro",
    "Distrito Capital",
    "Falcón",
    "Guárico",
    "La Guaira",
    "Lara",
    "Mérida",
    "Miranda",
    "Monagas",
    "Nueva Esparta",
    "Portuguesa",
    "Sucre",
    "Táchira",
    "Trujillo",
    "Yaracuy",
    "Zulia",
  ].sort() // Ordenar alfabéticamente

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Caso: {initialData?.patientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {/* Sección de Información Básica del Caso */}
          <div className="space-y-2 col-span-full">
            <h3 className="text-lg font-semibold">Información Básica del Caso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Input id="client" value={client} onChange={(e) => setClient(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeOfRequirement">Tipo de Requerimiento</Label>
                <Select value={typeOfRequirement} onValueChange={setTypeOfRequirement} required>
                  <SelectTrigger id="typeOfRequirement">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTA">Consulta</SelectItem>
                    <SelectItem value="EXAMEN">Examen</SelectItem>
                    <SelectItem value="PROCEDIMIENTO">Procedimiento</SelectItem>
                    <SelectItem value="HOSPITALIZACION">Hospitalización</SelectItem>
                    <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedAnalystId">Asignar a Analista Concertado</Label>
                <Select value={assignedAnalystId} onValueChange={setAssignedAnalystId} required>
                  <SelectTrigger id="assignedAnalystId">
                    <SelectValue placeholder="Seleccione un analista" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysts.length === 0 ? (
                      <SelectItem value="no-baremos-available" disabled>
                        No hay analistas disponibles
                      </SelectItem>
                    ) : (
                      analysts.map((analyst) => (
                        <SelectItem key={analyst.id} value={analyst.id}>
                          {analyst.name || analyst.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baremo">Baremo Asignado</Label>
                <Select value={baremoId} onValueChange={setBaremoId} required>
                  <SelectTrigger id="baremo">
                    <SelectValue placeholder="Seleccione un baremo" />
                  </SelectTrigger>
                  <SelectContent>
                    {baremos.length === 0 ? (
                      <SelectItem value="no-baremos-available" disabled>
                        No hay baremos disponibles
                      </SelectItem>
                    ) : (
                      baremos.map((baremo) => (
                        <SelectItem key={baremo.id} value={baremo.id}>
                          {baremo.name} ({baremo.clinicName})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sección de Datos del Paciente */}
          <div className="space-y-2 col-span-full">
            <h3 className="text-lg font-semibold mt-4">Datos del Paciente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nombre del Paciente</Label>
                <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciPatient">C.I. del Paciente</Label>
                <Input id="ciPatient" value={ciPatient} onChange={(e) => setCiPatient(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Teléfono del Paciente</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientOtherPhone">Otro Teléfono Paciente</Label>
                <Input
                  id="patientOtherPhone"
                  type="tel"
                  value={patientOtherPhone}
                  onChange={(e) => setPatientOtherPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientFixedPhone">Teléfono Fijo Paciente</Label>
                <Input
                  id="patientFixedPhone"
                  type="tel"
                  value={patientFixedPhone}
                  onChange={(e) => setPatientFixedPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientBirthDate">Fecha de Nacimiento Paciente</Label>
                <Input
                  id="patientBirthDate"
                  type="date"
                  value={patientBirthDate}
                  onChange={(e) => setPatientBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAge">Edad del Paciente</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientGender">Género del Paciente</Label>
                <Select value={patientGender} onValueChange={setPatientGender}>
                  <SelectTrigger id="patientGender">
                    <SelectValue placeholder="Seleccione género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Sección de Información Adicional */}
          <div className="space-y-2 col-span-full">
            <h3 className="text-lg font-semibold mt-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciTitular">C.I. del Titular</Label>
                <Input id="ciTitular" value={ciTitular} onChange={(e) => setCiTitular(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holderCI">C.I. del Tomador</Label>
                <Input id="holderCI" value={holderCI} onChange={(e) => setHolderCI(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collective">Colectivo</Label>
                <Input id="collective" value={collective} onChange={(e) => setCollective(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor</Label>
                <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {venezuelanStates.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Sección de Datos de la Cita y Auditoría (existente) */}
          <div className="space-y-2 col-span-full">
            <h3 className="text-lg font-semibold mt-4">Datos de la Cita y Auditoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Médico</Label>
                <Input id="doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Horario</Label>
                <Input
                  id="schedule"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ej: 10:00 AM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultory">Consultorio</Label>
                <Input
                  id="consultory"
                  value={consultory}
                  onChange={(e) => setConsultory(e.target.value)}
                  placeholder="Ej: Consultorio 3"
                />
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="results">Resultados (Diagnósticos, Exámenes, etc.)</Label>
                <Textarea
                  id="results"
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Ingrese los resultados de la cita aquí..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="col-span-full flex justify-end mt-6">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
