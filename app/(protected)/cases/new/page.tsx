"use client"

import { NewCaseForm } from "@/components/new-case-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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
  holderId: string
  patientId: string
  relationshipType?: string
}

export default function NewCasePage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateCase = async (newCaseData: NewCaseData) => {
    try {
      // Crear o actualizar titular si es necesario
      let holderId = newCaseData.holderId
      if (!holderId && newCaseData.holderCI) {
        const holderResponse = await fetch("/api/insurance-holders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ci: newCaseData.holderCI,
            firstName: newCaseData.patientName.split(" ")[0],
            lastName: newCaseData.patientName.split(" ").slice(1).join(" "),
            phone: newCaseData.patientPhone,
            email: newCaseData.creatorEmail,
            birthDate: newCaseData.patientBirthDate,
            gender: newCaseData.patientGender,
            address: newCaseData.address,
            clientId: "1", // Esto debería venir del formulario
            policyNumber: "",
            policyType: "",
            policyStatus: "active",
          }),
        })

        if (holderResponse.ok) {
          const holder = await holderResponse.json()
          holderId = holder.id
        }
      }

      // Crear o actualizar paciente si es necesario
      let patientId = newCaseData.patientId
      if (!patientId && newCaseData.ciPatient) {
        const patientResponse = await fetch("/api/patients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ci: newCaseData.ciPatient,
            firstName: newCaseData.patientName.split(" ")[0],
            lastName: newCaseData.patientName.split(" ").slice(1).join(" "),
            phone: newCaseData.patientPhone,
            email: newCaseData.creatorEmail,
            birthDate: newCaseData.patientBirthDate,
            gender: newCaseData.patientGender,
            address: newCaseData.address,
            otherPhone: newCaseData.patientOtherPhone,
            fixedPhone: newCaseData.patientFixedPhone,
            age: newCaseData.patientAge,
            collective: newCaseData.collective,
          }),
        })

        if (patientResponse.ok) {
          const patient = await patientResponse.json()
          patientId = patient.id
        }
      }

      // Crear relación titular-paciente si es necesario
      if (holderId && patientId && newCaseData.relationshipType && newCaseData.relationshipType !== "titular") {
        await fetch("/api/holder-patient-relationships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            holderId: holderId,
            patientId: patientId,
            relationshipType: newCaseData.relationshipType,
            isPrimary: newCaseData.relationshipType === "titular",
          }),
        })
      }

      // Crear el caso
      const caseResponse = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newCaseData,
          holderId: holderId,
          patientId: patientId,
        }),
      })

      if (!caseResponse.ok) {
        const errorData = await caseResponse.json()
        throw new Error(errorData.error || "Failed to create case.")
      }

      const newCase = await caseResponse.json()
      toast({
        title: "Éxito",
        description: `Caso ${newCase.id} creado correctamente.`,
        variant: "success",
      })
      router.push(`/cases/${newCase.id}`)
    } catch (error: any) {
      console.error("Error creating case:", error)
      toast({
        title: "Error",
        description: error.message || "Error al crear el caso.",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Crear Nuevo Caso</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Nuevo Caso</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCaseForm onSave={handleCreateCase} />
        </CardContent>
      </Card>
    </main>
  )
}
