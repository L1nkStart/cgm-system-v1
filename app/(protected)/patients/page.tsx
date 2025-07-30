"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, User, Phone, Mail, MapPin, Calendar, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
    isActive: boolean
    created_at: string
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        fetchPatients()
    }, [])

    useEffect(() => {
        const filtered = patients.filter(
            (patient) =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone.includes(searchTerm) ||
                (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        setFilteredPatients(filtered)
    }, [searchTerm, patients])

    const fetchPatients = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/patients")
            if (!response.ok) throw new Error("Failed to fetch patients")

            const data = await response.json()
            setPatients(data)
            setFilteredPatients(data)
        } catch (error) {
            console.error("Error fetching patients:", error)
            toast({
                title: "Error",
                description: "Error al cargar los pacientes",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "No especificada"
        return new Date(dateString).toLocaleDateString("es-ES")
    }

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return null
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Cargando pacientes...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
                    <p className="text-gray-600 mt-1">Gestión de información de pacientes</p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""}
                </Badge>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar por nombre, cédula, teléfono o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                    <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                                        <p className="text-sm text-gray-600">{patient.ci}</p>
                                    </div>
                                </div>
                                <Badge variant={patient.isActive ? "default" : "secondary"}>
                                    {patient.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{patient.phone}</span>
                            </div>

                            {patient.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{patient.email}</span>
                                </div>
                            )}

                            {patient.birthDate && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>
                                        {formatDate(patient.birthDate)}
                                        {patient.birthDate && (
                                            <span className="text-gray-500 ml-1">({calculateAge(patient.birthDate)} años)</span>
                                        )}
                                    </span>
                                </div>
                            )}

                            {(patient.city || patient.state) && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>
                                        {patient.city && patient.state
                                            ? `${patient.city}, ${patient.state}`
                                            : patient.city || patient.state}
                                    </span>
                                </div>
                            )}

                            {patient.bloodType && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Heart className="h-4 w-4 text-red-400" />
                                    <span>Tipo: {patient.bloodType}</span>
                                </div>
                            )}

                            {patient.allergies && (
                                <div className="text-sm">
                                    <span className="font-medium text-orange-600">Alergias:</span>
                                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">{patient.allergies}</p>
                                </div>
                            )}

                            {patient.emergencyContact && (
                                <div className="text-sm border-t pt-2">
                                    <span className="font-medium text-gray-700">Contacto de emergencia:</span>
                                    <p className="text-gray-600 text-xs">
                                        {patient.emergencyContact}
                                        {patient.emergencyPhone && ` - ${patient.emergencyPhone}`}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPatients.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
                        <p className="text-gray-600">
                            {searchTerm
                                ? "No hay pacientes que coincidan con tu búsqueda."
                                : "Aún no hay pacientes registrados en el sistema."}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
