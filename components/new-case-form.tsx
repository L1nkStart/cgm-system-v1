"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Importar Textarea
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Analyst {
  id: string
  email: string
  name: string
  role: string // Asegurarse de que el rol esté presente para el filtrado
}

export function NewCaseForm() {
  const [client, setClient] = useState("")
  const [date, setDate] = useState("")
  const [patientName, setPatientName] = useState("")
  const [ciPatient, setCiPatient] = useState("") // Cambiado de patientCI a ciPatient
  const [patientPhone, setPatientPhone] = useState("")
  const [assignedAnalystId, setAssignedAnalystId] = useState("") // Cambiado de analystId a assignedAnalystId
  const [analysts, setAnalysts] = useState<Analyst[]>([])

  // Nuevos estados para campos adicionales
  const [ciTitular, setCiTitular] = useState("")
  const [patientOtherPhone, setPatientOtherPhone] = useState("")
  const [patientFixedPhone, setPatientFixedPhone] = useState("")
  const [patientBirthDate, setPatientBirthDate] = useState("")
  const [patientAge, setPatientAge] = useState<number | string>("")
  const [patientGender, setPatientGender] = useState("")
  const [collective, setCollective] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [provider, setProvider] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [holderCI, setHolderCI] = useState("")
  const [typeOfRequirement, setTypeOfRequirement] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchAnalysts()
  }, [])

  const fetchAnalysts = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch analysts")
      }
      const data: Analyst[] = await response.json()
      // Filtrar por usuarios con el rol "Analista Concertado"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!client || !date || !patientName || !ciPatient || !patientPhone || !assignedAnalystId || !typeOfRequirement) {
      toast({
        title: "Error",
        description:
          "Por favor, complete todos los campos requeridos: Cliente, Fecha, Nombre Paciente, CI Paciente, Teléfono Paciente, Analista Asignado y Tipo de Requerimiento.",
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
          client,
          date,
          patientName,
          ciPatient,
          patientPhone,
          assignedAnalystId,
          status: "Pendiente", // Estado inicial
          ciTitular,
          patientOtherPhone,
          patientFixedPhone,
          patientBirthDate: patientBirthDate || null, // Enviar null si está vacío
          patientAge: patientAge ? Number(patientAge) : null, // Convertir a número o null
          patientGender,
          collective,
          diagnosis,
          provider,
          state,
          city,
          address,
          holderCI,
          typeOfRequirement,
          services: [], // Inicializar servicios como un array vacío
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
      setClient("")
      setDate("")
      setPatientName("")
      setCiPatient("")
      setPatientPhone("")
      setAssignedAnalystId("")
      setCiTitular("")
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

      router.push("/dashboard") // Redirigir al dashboard después del registro exitoso
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Nuevo Caso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      // Usamos un <p> en lugar de <SelectItem> para mostrar el mensaje.
                      // Las clases de Tailwind le dan un estilo similar al del resto de la UI.
                      <p className="p-4 text-center text-sm text-muted-foreground">
                        No hay analistas disponibles
                      </p>
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
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
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

          <div className="col-span-full flex justify-end">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
              Registrar Caso
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
