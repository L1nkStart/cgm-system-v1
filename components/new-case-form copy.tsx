"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserIcon, UserCheck } from "lucide-react"
import { ProcedureSelector } from "./procedure-selector"
import { useRouter } from "next/navigation"


interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface NewCaseData {
  client: string
  date: string
  patientName: string
  ciPatient: string
  patientPhone: string
  assignedAnalystId: string
  status: string
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
  baremoId: string
  patientId?: string
}

interface Analyst {
  id: string
  name: string
  role: string
  assignedStates: string[]
}

interface Client {
  id: string
  name: string
  rif: string
  baremoId?: string
  baremoName?: string
  baremoClinicName?: string
}

interface Patient {
  id: string
  ci: string
  name: string
  phone: string
  otherPhone?: string
  fixedPhone?: string
  birthDate?: string
  age?: number
  gender?: string
  address?: string
  city?: string
  state?: string
  email?: string
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
}

export function NewCaseForm() {
  const [clientId, setClientId] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const router = useRouter()

  // Patient fields
  const [ciPatient, setCiPatient] = useState("")
  const [patientData, setPatientData] = useState<Patient | null>(null)
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientOtherPhone, setPatientOtherPhone] = useState("")
  const [patientFixedPhone, setPatientFixedPhone] = useState("")
  const [patientBirthDate, setPatientBirthDate] = useState("")
  const [patientAge, setPatientAge] = useState<number | string>("")
  const [patientGender, setPatientGender] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientAddress, setPatientAddress] = useState("")
  const [patientCity, setPatientCity] = useState("")
  const [patientState, setPatientState] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [allergies, setAllergies] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")

  const [assignedAnalystId, setAssignedAnalystId] = useState("")
  const [status, setStatus] = useState("Pendiente")
  const [collective, setCollective] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [provider, setProvider] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [holderCI, setHolderCI] = useState("")
  const [typeOfRequirement, setTypeOfRequirement] = useState("CONSULTA")
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingPatient, setIsLoadingPatient] = useState(false)
  const { toast } = useToast()


  const states = [
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
  ]

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userResponse = await fetch("/api/current-user-role")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUser(userData)
        }

        // Fetch analysts
        const usersResponse = await fetch("/api/users")
        if (!usersResponse.ok) throw new Error("Failed to fetch users.")
        const usersData: Analyst[] = await usersResponse.json()
        setAnalysts(usersData.filter((user) => user.role === "Analista Concertado" || user.role === "Médico Auditor"))

        // Fetch clients
        const clientsResponse = await fetch("/api/clients")
        if (!clientsResponse.ok) throw new Error("Failed to fetch clients.")
        const clientsData: Client[] = await clientsResponse.json()
        setClients(clientsData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al cargar datos iniciales.",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [])

  const handleClientChange = (value: string) => {
    setClientId(value)
    const client = clients.find((c) => c.id === value)
    setSelectedClient(client || null)
    // Reset services when client changes
    setSelectedServices([])
  }

  const handleCIChange = async (value: string) => {
    setCiPatient(value)

    if (value.length >= 7) {
      // Minimum CI length
      setIsLoadingPatient(true)
      try {
        const response = await fetch(`/api/patients?ci=${encodeURIComponent(value)}`)

        if (response.ok) {
          const patient = await response.json()
          setPatientData(patient)
          setIsNewPatient(false)

          // Load patient data into form
          setPatientName(patient.name || "")
          setPatientPhone(patient.phone || "")
          setPatientOtherPhone(patient.otherPhone || "")
          setPatientFixedPhone(patient.fixedPhone || "")
          setPatientBirthDate(patient.birthDate ? patient.birthDate.split("T")[0] : "")
          setPatientAge(patient.age || "")
          setPatientGender(patient.gender || "")
          setPatientEmail(patient.email || "")
          setPatientAddress(patient.address || "")
          setPatientCity(patient.city || "")
          setPatientState(patient.state || "")
          setEmergencyContact(patient.emergencyContact || "")
          setEmergencyPhone(patient.emergencyPhone || "")
          setBloodType(patient.bloodType || "")
          setAllergies(patient.allergies || "")
          setMedicalHistory(patient.medicalHistory || "")

          toast({
            title: "Paciente encontrado",
            description: `Se cargaron los datos de ${patient.name}`,
            variant: "default",
          })
        } else if (response.status === 404) {
          // Patient not found, prepare for new patient
          setPatientData(null)
          setIsNewPatient(true)
          clearPatientForm()

          toast({
            title: "Paciente nuevo",
            description: "No se encontró un paciente con esta cédula. Complete los datos para registrarlo.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error fetching patient:", error)
        toast({
          title: "Error",
          description: "Error al buscar el paciente",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPatient(false)
      }
    } else {
      // Clear patient data if CI is too short
      setPatientData(null)
      setIsNewPatient(false)
      clearPatientForm()
    }
  }

  const clearPatientForm = () => {
    setPatientName("")
    setPatientPhone("")
    setPatientOtherPhone("")
    setPatientFixedPhone("")
    setPatientBirthDate("")
    setPatientAge("")
    setPatientGender("")
    setPatientEmail("")
    setPatientAddress("")
    setPatientCity("")
    setPatientState("")
    setEmergencyContact("")
    setEmergencyPhone("")
    setBloodType("")
    setAllergies("")
    setMedicalHistory("")
  }

  const createPatient = async (): Promise<string | null> => {
    try {
      const patientPayload = {
        ci: ciPatient,
        name: patientName,
        phone: patientPhone,
        otherPhone: patientOtherPhone || null,
        fixedPhone: patientFixedPhone || null,
        birthDate: patientBirthDate || null,
        age: patientAge ? Number(patientAge) : null,
        gender: patientGender || null,
        address: patientAddress || null,
        city: patientCity || null,
        state: patientState || null,
        email: patientEmail || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        medicalHistory: medicalHistory || null,
      }

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear el paciente")
      }

      const newPatient = await response.json()
      return newPatient.id
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el paciente",
        variant: "destructive",
      })
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !clientId ||
      !date ||
      !patientName ||
      !ciPatient ||
      !patientPhone ||
      !assignedAnalystId ||
      !status ||
      !selectedClient?.baremoId ||
      !state
    ) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    let patientId = patientData?.id || null

    // If it's a new patient, create it first
    if (isNewPatient) {
      patientId = await createPatient()
      if (!patientId) {
        toast({
          title: "Error",
          description: "Error al crear paciente.",
          variant: "destructive",
        })
        return // Error creating patient, stop here
      }
    }

    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Debe añadir al menos un procedimiento al caso.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          client: selectedClient?.name,
          date,
          patientName,
          ciPatient,
          patientPhone,
          assignedAnalystId,
          status: "Pendiente",
          ciTitular: holderCI,
          patientOtherPhone,
          patientFixedPhone,
          patientBirthDate: patientBirthDate || null,
          patientAge: patientAge ? Number(patientAge) : null,
          patientGender,
          collective,
          diagnosis,
          provider,
          state,
          city,
          address,
          holderCI,
          services: selectedServices,
          typeOfRequirement,
          baremoId: selectedClient.baremoId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to register case")
      }

      toast({
        title: "Éxito",
        description: "Caso registrado y asignado correctamente.",
      })

      // Reset form
      setClientId("")
      setSelectedClient(null)
      setDate("")
      setPatientName("")
      setCiPatient("")
      setPatientPhone("")
      setAssignedAnalystId("")
      // setCiTitular("")
      setPatientOtherPhone("")
      setPatientFixedPhone("")
      setPatientBirthDate("")
      setPatientAge("")
      setPatientGender("")
      setCollective("")
      setDiagnosis("")
      setProvider("")
      setState("")
      setCity("")
      setAddress("")
      setHolderCI("")
      setTypeOfRequirement("")
      // setSelectedBaremoId("")
      // setSelectedBaremoProcedures([])
      setSelectedServices([])

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error registering case:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el caso.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="clientId">Cliente *</Label>
            <Select value={clientId} onValueChange={handleClientChange} required>
              <SelectTrigger id="clientId">
                <SelectValue placeholder="Seleccione un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.rif})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClient && (
            <div className="grid gap-2">
              <Label>Baremo Asignado</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm">
                <div className="font-medium">{selectedClient.baremoName || "Sin baremo"}</div>
                {selectedClient.baremoClinicName && (
                  <div className="text-gray-600">{selectedClient.baremoClinicName}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {patientData ? <UserCheck className="h-5 w-5 text-green-600" /> : <UserIcon className="h-5 w-5" />}
            Información del Paciente
            {patientData && <Badge variant="secondary">Paciente Existente</Badge>}
            {isNewPatient && <Badge variant="outline">Paciente Nuevo</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ciPatient">C.I. Paciente *</Label>
              <Input
                id="ciPatient"
                value={ciPatient}
                onChange={(e) => handleCIChange(e.target.value)}
                placeholder="V-12345678"
                required
                disabled={isLoadingPatient}
              />
              {isLoadingPatient && <p className="text-sm text-gray-500">Buscando paciente...</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientName">Nombre del Paciente *</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientPhone">Teléfono Principal *</Label>
              <Input
                id="patientPhone"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
                disabled={!!patientData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="patientOtherPhone">Otro Teléfono</Label>
              <Input
                id="patientOtherPhone"
                value={patientOtherPhone}
                onChange={(e) => setPatientOtherPhone(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientFixedPhone">Teléfono Fijo</Label>
              <Input
                id="patientFixedPhone"
                value={patientFixedPhone}
                onChange={(e) => setPatientFixedPhone(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientEmail">Email</Label>
              <Input
                id="patientEmail"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                disabled={!!patientData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="patientBirthDate">Fecha de Nacimiento</Label>
              <Input
                id="patientBirthDate"
                type="date"
                value={patientBirthDate}
                onChange={(e) => setPatientBirthDate(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientAge">Edad</Label>
              <Input
                id="patientAge"
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientGender">Género</Label>
              <Select value={patientGender} onValueChange={setPatientGender} disabled={!!patientData}>
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
            <div className="grid gap-2">
              <Label htmlFor="bloodType">Tipo de Sangre</Label>
              <Select value={bloodType} onValueChange={setBloodType} disabled={!!patientData}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="patientAddress">Dirección</Label>
              <Textarea
                id="patientAddress"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientCity">Ciudad</Label>
              <Input
                id="patientCity"
                value={patientCity}
                onChange={(e) => setPatientCity(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patientState">Estado</Label>
              <Select value={patientState} onValueChange={setPatientState} disabled={!!patientData}>
                <SelectTrigger id="patientState">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
              <Input
                id="emergencyContact"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="emergencyPhone"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                disabled={!!patientData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                disabled={!!patientData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicalHistory">Historial Médico</Label>
              <Textarea
                id="medicalHistory"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                disabled={!!patientData}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedure Selection */}
      {selectedClient?.baremoId && (
        <ProcedureSelector
          baremoId={selectedClient.baremoId}
          onServicesChange={setSelectedServices}
          initialServices={selectedServices}
        />
      )}

      {/* Case Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Caso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedAnalystId">Analista Asignado *</Label>
              <Select value={assignedAnalystId} onValueChange={setAssignedAnalystId} required>
                <SelectTrigger id="assignedAnalystId">
                  <SelectValue placeholder="Seleccione un analista" />
                </SelectTrigger>
                <SelectContent>
                  {analysts.map((analyst) => (
                    <SelectItem key={analyst.id} value={analyst.id}>
                      {analyst.name} ({analyst.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado del Caso *</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente por Agendar">Pendiente por Agendar</SelectItem>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Atendido">Atendido</SelectItem>
                  <SelectItem value="Pendiente por Auditar">Pendiente por Auditar</SelectItem>
                  <SelectItem value="Auditado">Auditado</SelectItem>
                  <SelectItem value="Aprobado">Aprobado</SelectItem>
                  <SelectItem value="Rechazado">Rechazado</SelectItem>
                  <SelectItem value="Anulado">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="state">Estado (Geográfico) *</Label>
              <Select value={state} onValueChange={setState} required>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="typeOfRequirement">Tipo de Requerimiento</Label>
              <Select value={typeOfRequirement} onValueChange={setTypeOfRequirement}>
                <SelectTrigger id="typeOfRequirement">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTA">Consulta</SelectItem>
                  <SelectItem value="EXAMEN">Examen</SelectItem>
                  <SelectItem value="TRATAMIENTO">Tratamiento</SelectItem>
                  <SelectItem value="CIRUGIA">Cirugía</SelectItem>
                  <SelectItem value="HOSPITALIZACION">Hospitalización</SelectItem>
                  <SelectItem value="OTROS">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección del Caso</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="collective">Colectivo</Label>
              <Input id="collective" value={collective} onChange={(e) => setCollective(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Proveedor</Label>
              <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderCI">C.I. Titular (si diferente al paciente)</Label>
              <Input id="holderCI" value={holderCI} onChange={(e) => setHolderCI(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        Crear Caso
      </Button>
    </form>
  )
}
