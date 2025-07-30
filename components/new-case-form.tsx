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
import { UserIcon, UserCheck, Shield, ShieldCheck } from "lucide-react"
import { ProcedureSelector } from "./procedure-selector"

interface Service {
  name: string
  type: string
  amount: number
  attended: boolean
}

interface NewCaseData {
  clientId: string
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
  holderId?: string
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

interface InsuranceHolder {
  id: string
  ci: string
  name: string
  phone: string
  otherPhone?: string
  fixedPhone?: string
  email?: string
  birthDate?: string
  age?: number
  gender?: string
  address?: string
  city?: string
  state?: string
  clientId?: string
  clientName?: string
  insuranceCompany?: string
  policyNumber?: string
  policyType?: string
  policyStatus?: string
  policyStartDate?: string
  policyEndDate?: string
  coverageType?: string
  maxCoverageAmount?: number
  usedCoverageAmount?: number
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  isActive?: boolean
}

export function NewCaseForm({ onSave }: { onSave: (data: NewCaseData) => void }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  // Holder fields (primary)
  const [holderCI, setHolderCI] = useState("")
  const [holderData, setHolderData] = useState<InsuranceHolder | null>(null)
  const [isNewHolder, setIsNewHolder] = useState(false)
  const [holderName, setHolderName] = useState("")
  const [holderPhone, setHolderPhone] = useState("")
  const [holderOtherPhone, setHolderOtherPhone] = useState("")
  const [holderFixedPhone, setHolderFixedPhone] = useState("")
  const [holderEmail, setHolderEmail] = useState("")
  const [holderBirthDate, setHolderBirthDate] = useState("")
  const [holderAge, setHolderAge] = useState<number | string>("")
  const [holderGender, setHolderGender] = useState("")
  const [holderAddress, setHolderAddress] = useState("")
  const [holderCity, setHolderCity] = useState("")
  const [holderState, setHolderState] = useState("")
  const [holderEmergencyContact, setHolderEmergencyContact] = useState("")
  const [holderEmergencyPhone, setHolderEmergencyPhone] = useState("")
  const [holderBloodType, setHolderBloodType] = useState("")
  const [holderAllergies, setHolderAllergies] = useState("")
  const [holderMedicalHistory, setHolderMedicalHistory] = useState("")
  const [policyNumber, setPolicyNumber] = useState("")
  const [policyType, setPolicyType] = useState("Individual")
  const [policyStatus, setPolicyStatus] = useState("Activo")
  const [policyStartDate, setPolicyStartDate] = useState("")
  const [policyEndDate, setPolicyEndDate] = useState("")
  const [coverageType, setCoverageType] = useState("")
  const [maxCoverageAmount, setMaxCoverageAmount] = useState<number | string>("")

  // Client data (loaded from holder)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  // Patient selection mode
  const [patientMode, setPatientMode] = useState<"same" | "different">("same")
  const [relationshipType, setRelationshipType] = useState("Titular")

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

  // Case fields
  const [assignedAnalystId, setAssignedAnalystId] = useState("")
  const [status, setStatus] = useState("Pendiente por Agendar")
  const [collective, setCollective] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [provider, setProvider] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [typeOfRequirement, setTypeOfRequirement] = useState("CONSULTA")
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  const [analysts, setAnalysts] = useState<Analyst[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingHolder, setIsLoadingHolder] = useState(false)
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

  const relationshipTypes = [
    "Titular",
    "Cónyuge",
    "Hijo/a",
    "Padre/Madre",
    "Hermano/a",
    "Abuelo/a",
    "Nieto/a",
    "Otro familiar",
    "Otro",
  ]

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

  const handleHolderCIChange = async (value: string) => {
    setHolderCI(value)

    if (value.length >= 7) {
      setIsLoadingHolder(true)
      try {
        const response = await fetch(`/api/insurance-holders?ci=${encodeURIComponent(value)}`)

        if (response.ok) {
          const holder = await response.json()
          setHolderData(holder)
          setIsNewHolder(false)

          // Load holder data into form
          setHolderName(holder.name || "")
          setHolderPhone(holder.phone || "")
          setHolderOtherPhone(holder.otherPhone || "")
          setHolderFixedPhone(holder.fixedPhone || "")
          setHolderEmail(holder.email || "")
          setHolderBirthDate(holder.birthDate ? holder.birthDate.split("T")[0] : "")
          setHolderAge(holder.age || "")
          setHolderGender(holder.gender || "")
          setHolderAddress(holder.address || "")
          setHolderCity(holder.city || "")
          setHolderState(holder.state || "")
          setHolderEmergencyContact(holder.emergencyContact || "")
          setHolderEmergencyPhone(holder.emergencyPhone || "")
          setHolderBloodType(holder.bloodType || "")
          setHolderAllergies(holder.allergies || "")
          setHolderMedicalHistory(holder.medicalHistory || "")
          setPolicyNumber(holder.policyNumber || "")
          setPolicyType(holder.policyType || "Individual")
          setPolicyStatus(holder.policyStatus || "Activo")
          setPolicyStartDate(holder.policyStartDate ? holder.policyStartDate.split("T")[0] : "")
          setPolicyEndDate(holder.policyEndDate ? holder.policyEndDate.split("T")[0] : "")
          setCoverageType(holder.coverageType || "")
          setMaxCoverageAmount(holder.maxCoverageAmount || "")

          // Load client data if holder has clientId
          if (holder.clientId) {
            const client = clients.find((c) => c.id === holder.clientId)
            if (client) {
              setSelectedClient(client)
            } else {
              // Fetch client data if not in the list
              try {
                const clientResponse = await fetch(`/api/clients?id=${holder.clientId}`)
                if (clientResponse.ok) {
                  const clientData = await clientResponse.json()
                  setSelectedClient(clientData)
                }
              } catch (error) {
                console.error("Error fetching client:", error)
              }
            }
          }

          toast({
            title: "Titular encontrado",
            description: `Se cargaron los datos de ${holder.name}`,
            variant: "default",
          })
        } else if (response.status === 404) {
          // Holder not found, prepare for new holder
          setHolderData(null)
          setIsNewHolder(true)
          setSelectedClient(null)
          clearHolderForm()

          toast({
            title: "Titular nuevo",
            description: "No se encontró un titular con esta cédula. Complete los datos para registrarlo.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error fetching holder:", error)
        toast({
          title: "Error",
          description: "Error al buscar el titular",
          variant: "destructive",
        })
      } finally {
        setIsLoadingHolder(false)
      }
    } else {
      // Clear holder data if CI is too short
      setHolderData(null)
      setIsNewHolder(false)
      setSelectedClient(null)
      clearHolderForm()
    }
  }

  const handlePatientModeChange = (mode: "same" | "different") => {
    setPatientMode(mode)

    if (mode === "same") {
      // Use holder data as patient data
      setCiPatient(holderCI)
      setPatientName(holderName)
      setPatientPhone(holderPhone)
      setPatientOtherPhone(holderOtherPhone)
      setPatientFixedPhone(holderFixedPhone)
      setPatientEmail(holderEmail)
      setPatientBirthDate(holderBirthDate)
      setPatientAge(holderAge)
      setPatientGender(holderGender)
      setPatientAddress(holderAddress)
      setPatientCity(holderCity)
      setPatientState(holderState)
      setEmergencyContact(holderEmergencyContact)
      setEmergencyPhone(holderEmergencyPhone)
      setBloodType(holderBloodType)
      setAllergies(holderAllergies)
      setMedicalHistory(holderMedicalHistory)
      setRelationshipType("Titular")
      setPatientData(null)
      setIsNewPatient(false)
    } else {
      // Clear patient data for manual entry
      clearPatientForm()
      setRelationshipType("Cónyuge")
    }
  }

  const handlePatientCIChange = async (value: string) => {
    setCiPatient(value)

    if (value.length >= 7 && patientMode === "different") {
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
    }
  }

  const clearHolderForm = () => {
    setHolderName("")
    setHolderPhone("")
    setHolderOtherPhone("")
    setHolderFixedPhone("")
    setHolderEmail("")
    setHolderBirthDate("")
    setHolderAge("")
    setHolderGender("")
    setHolderAddress("")
    setHolderCity("")
    setHolderState("")
    setHolderEmergencyContact("")
    setHolderEmergencyPhone("")
    setHolderBloodType("")
    setHolderAllergies("")
    setHolderMedicalHistory("")
    setPolicyNumber("")
    setPolicyType("Individual")
    setPolicyStatus("Activo")
    setPolicyStartDate("")
    setPolicyEndDate("")
    setCoverageType("")
    setMaxCoverageAmount("")
  }

  const clearPatientForm = () => {
    setCiPatient("")
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

  const createHolder = async (): Promise<string | null> => {
    try {
      const holderPayload = {
        ci: holderCI,
        name: holderName,
        phone: holderPhone,
        otherPhone: holderOtherPhone || null,
        fixedPhone: holderFixedPhone || null,
        email: holderEmail || null,
        birthDate: holderBirthDate || null,
        age: holderAge ? Number(holderAge) : null,
        gender: holderGender || null,
        address: holderAddress || null,
        city: holderCity || null,
        state: holderState || null,
        clientId: selectedClient?.id || null,
        policyNumber: policyNumber || null,
        policyType: policyType || "Individual",
        policyStatus: policyStatus || "Activo",
        policyStartDate: policyStartDate || null,
        policyEndDate: policyEndDate || null,
        coverageType: coverageType || null,
        maxCoverageAmount: maxCoverageAmount ? Number(maxCoverageAmount) : null,
        emergencyContact: holderEmergencyContact || null,
        emergencyPhone: holderEmergencyPhone || null,
        bloodType: holderBloodType || null,
        allergies: holderAllergies || null,
        medicalHistory: holderMedicalHistory || null,
        createAsPatient: patientMode === "same",
      }

      const response = await fetch("/api/insurance-holders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holderPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear el titular")
      }

      const newHolder = await response.json()
      return newHolder.id
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el titular",
        variant: "destructive",
      })
      return null
    }
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

  const createHolderPatientRelationship = async (holderId: string, patientId: string) => {
    try {
      const relationshipPayload = {
        holderId,
        patientId,
        relationshipType,
        isPrimary: relationshipType === "Titular",
      }

      const response = await fetch("/api/holder-patient-relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(relationshipPayload),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Error creating holder-patient relationship:", error)
      }
    } catch (error) {
      console.error("Error creating holder-patient relationship:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !holderCI ||
      !holderName ||
      !holderPhone ||
      !date ||
      !patientName ||
      !ciPatient ||
      !patientPhone ||
      !assignedAnalystId ||
      !status ||
      !selectedClient?.baremoId ||
      !state
    ) {
      console.log(
        patientName,
        ciPatient,
        patientPhone, "AX")
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    let holderId = holderData?.id || null
    let patientId = patientData?.id || null

    // Create holder if new
    if (isNewHolder) {
      holderId = await createHolder()
      if (!holderId) {
        alert("Nei")
        return // Error creating holder, stop here
      }
    }

    // Create patient if new and different from holder
    if (patientMode === "different" && isNewPatient) {
      patientId = await createPatient()
      if (!patientId) {
        alert("Nei")
        return // Error creating patient, stop here
      }
    }

    // If patient mode is "same", use holder as patient
    if (patientMode === "same") {
      patientId = holderId
    }

    // Create holder-patient relationship if they are different
    if (patientMode === "different" && holderId && patientId) {
      await createHolderPatientRelationship(holderId, patientId)
    }

    const newCase: NewCaseData = {
      clientId: selectedClient.id,
      client: selectedClient.name,
      date,
      patientName,
      ciPatient,
      patientPhone,
      assignedAnalystId,
      status,
      creatorName: currentUser?.name || "Coordinador Regional",
      creatorEmail: currentUser?.email || "coord@cgm.com",
      creatorPhone: currentUser?.phone || "0412-9999999",
      patientOtherPhone: patientOtherPhone || undefined,
      patientFixedPhone: patientFixedPhone || undefined,
      patientBirthDate: patientBirthDate || undefined,
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender: patientGender || undefined,
      collective: collective || undefined,
      diagnosis: diagnosis || undefined,
      provider: provider || undefined,
      state: state || undefined,
      city: city || undefined,
      address: address || undefined,
      holderCI: holderCI || undefined,
      services: selectedServices,
      typeOfRequirement,
      baremoId: selectedClient.baremoId,
      patientId: patientId || undefined,
      holderId: holderId || undefined,
    }

    onSave(newCase)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* Holder Information (Primary) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {holderData ? <ShieldCheck className="h-5 w-5 text-blue-600" /> : <Shield className="h-5 w-5" />}
            Información del Titular
            {holderData && <Badge variant="secondary">Titular Existente</Badge>}
            {isNewHolder && <Badge variant="outline">Titular Nuevo</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="holderCI">C.I. Titular *</Label>
              <Input
                id="holderCI"
                value={holderCI}
                onChange={(e) => handleHolderCIChange(e.target.value)}
                placeholder="V-12345678"
                required
                readOnly={isLoadingHolder}
              />
              {isLoadingHolder && <p className="text-sm text-gray-500">Buscando titular...</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderName">Nombre del Titular *</Label>
              <Input
                id="holderName"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderPhone">Teléfono Principal *</Label>
              <Input
                id="holderPhone"
                value={holderPhone}
                onChange={(e) => setHolderPhone(e.target.value)}
                required
                readOnly={!!holderData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="holderOtherPhone">Otro Teléfono</Label>
              <Input
                id="holderOtherPhone"
                value={holderOtherPhone}
                onChange={(e) => setHolderOtherPhone(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderFixedPhone">Teléfono Fijo</Label>
              <Input
                id="holderFixedPhone"
                value={holderFixedPhone}
                onChange={(e) => setHolderFixedPhone(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderEmail">Email</Label>
              <Input
                id="holderEmail"
                type="email"
                value={holderEmail}
                onChange={(e) => setHolderEmail(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="holderBirthDate">Fecha de Nacimiento</Label>
              <Input
                id="holderBirthDate"
                type="date"
                value={holderBirthDate}
                onChange={(e) => setHolderBirthDate(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderAge">Edad</Label>
              <Input
                id="holderAge"
                type="number"
                value={holderAge}
                onChange={(e) => setHolderAge(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderGender">Género</Label>
              <Select value={holderGender} onValueChange={setHolderGender} disabled={!!holderData}>
                <SelectTrigger id="holderGender">
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
              <Label htmlFor="holderBloodType">Tipo de Sangre</Label>
              <Select value={holderBloodType} onValueChange={setHolderBloodType} disabled={!!holderData}>
                <SelectTrigger id="holderBloodType">
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
              <Label htmlFor="holderAddress">Dirección</Label>
              <Textarea
                id="holderAddress"
                value={holderAddress}
                onChange={(e) => setHolderAddress(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderCity">Ciudad</Label>
              <Input
                id="holderCity"
                value={holderCity}
                onChange={(e) => setHolderCity(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderState">Estado</Label>
              <Select value={holderState} onValueChange={setHolderState} disabled={!!holderData}>
                <SelectTrigger id="holderState">
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
              <Label htmlFor="holderEmergencyContact">Contacto de Emergencia</Label>
              <Input
                id="holderEmergencyContact"
                value={holderEmergencyContact}
                onChange={(e) => setHolderEmergencyContact(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderEmergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="holderEmergencyPhone"
                value={holderEmergencyPhone}
                onChange={(e) => setHolderEmergencyPhone(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="holderAllergies">Alergias</Label>
              <Textarea
                id="holderAllergies"
                value={holderAllergies}
                onChange={(e) => setHolderAllergies(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="holderMedicalHistory">Historial Médico</Label>
              <Textarea
                id="holderMedicalHistory"
                value={holderMedicalHistory}
                onChange={(e) => setHolderMedicalHistory(e.target.value)}
                readOnly={!!holderData}
              />
            </div>
          </div>

          {/* Policy Information */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Información de la Póliza</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="policyNumber">Número de Póliza</Label>
                <Input
                  id="policyNumber"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  readOnly={!!holderData}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="policyType">Tipo de Póliza</Label>
                <Select value={policyType} onValueChange={setPolicyType} disabled={!!holderData}>
                  <SelectTrigger id="policyType">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Familiar">Familiar</SelectItem>
                    <SelectItem value="Corporativo">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="policyStatus">Estado de la Póliza</Label>
                <Select value={policyStatus} onValueChange={setPolicyStatus} disabled={!!holderData}>
                  <SelectTrigger id="policyStatus">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Suspendido">Suspendido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="policyStartDate">Fecha de Inicio</Label>
                <Input
                  id="policyStartDate"
                  type="date"
                  value={policyStartDate}
                  onChange={(e) => setPolicyStartDate(e.target.value)}
                  readOnly={!!holderData}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="policyEndDate">Fecha de Vencimiento</Label>
                <Input
                  id="policyEndDate"
                  type="date"
                  value={policyEndDate}
                  onChange={(e) => setPolicyEndDate(e.target.value)}
                  readOnly={!!holderData}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverageType">Tipo de Cobertura</Label>
                <Input
                  id="coverageType"
                  value={coverageType}
                  onChange={(e) => setCoverageType(e.target.value)}
                  readOnly={!!holderData}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxCoverageAmount">Monto Máximo de Cobertura</Label>
                <Input
                  id="maxCoverageAmount"
                  type="number"
                  value={maxCoverageAmount}
                  onChange={(e) => setMaxCoverageAmount(e.target.value)}
                  readOnly={!!holderData}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information (Auto-loaded from holder) */}
      {selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Cliente</p>
                  <p className="text-lg font-semibold">{selectedClient.name}</p>
                  <p className="text-sm text-gray-600">{selectedClient.rif}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Baremo Asignado</p>
                  <p className="text-lg font-semibold">{selectedClient.baremoName || "Sin baremo"}</p>
                  {selectedClient.baremoClinicName && (
                    <p className="text-sm text-gray-600">{selectedClient.baremoClinicName}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Selection */}
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
          {/* Patient Mode Selection */}
          <div className="grid gap-2">
            <Label>¿El titular es el paciente?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={patientMode === "same" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePatientModeChange("same")}
              >
                Sí, el titular es el paciente
              </Button>
              <Button
                type="button"
                variant={patientMode === "different" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePatientModeChange("different")}
              >
                No, es un familiar/vinculado
              </Button>
            </div>
          </div>

          {/* Relationship Type (only for different patients) */}
          {patientMode === "different" && (
            <div className="grid gap-2">
              <Label htmlFor="relationshipType">Relación con el Titular</Label>
              <Select value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger id="relationshipType">
                  <SelectValue placeholder="Seleccione relación" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Same Patient Info */}
          {patientMode === "same" && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Paciente:</strong> {holderName || "Titular"} ({holderCI})
              </p>
              <p className="text-xs text-green-600 mt-1">El titular será registrado como el paciente del caso.</p>
            </div>
          )}

          {/* Different Patient Form */}
          {patientMode === "different" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ciPatient">C.I. Paciente *</Label>
                  <Input
                    id="ciPatient"
                    value={ciPatient}
                    onChange={(e) => handlePatientCIChange(e.target.value)}
                    placeholder="V-12345678"
                    required
                    readOnly={isLoadingPatient}
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
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patientPhone">Teléfono Principal *</Label>
                  <Input
                    id="patientPhone"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                    readOnly={!!patientData}
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
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patientFixedPhone">Teléfono Fijo</Label>
                  <Input
                    id="patientFixedPhone"
                    value={patientFixedPhone}
                    onChange={(e) => setPatientFixedPhone(e.target.value)}
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patientEmail">Email</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    readOnly={!!patientData}
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
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patientAge">Edad</Label>
                  <Input
                    id="patientAge"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    readOnly={!!patientData}
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
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patientCity">Ciudad</Label>
                  <Input
                    id="patientCity"
                    value={patientCity}
                    onChange={(e) => setPatientCity(e.target.value)}
                    readOnly={!!patientData}
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
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    readOnly={!!patientData}
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
                    readOnly={!!patientData}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medicalHistory">Historial Médico</Label>
                  <Textarea
                    id="medicalHistory"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    readOnly={!!patientData}
                  />
                </div>
              </div>
            </>
          )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="collective">Colectivo</Label>
              <Input id="collective" value={collective} onChange={(e) => setCollective(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Proveedor</Label>
              <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} />
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
