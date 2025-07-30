"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Client {
    id: string
    name: string
    insuranceCompany: string
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

interface InsuranceHolderFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: (holder: Omit<InsuranceHolder, "id"> | Partial<InsuranceHolder>) => void
    initialData?: InsuranceHolder | null
}

export function InsuranceHolderForm({ isOpen, onClose, onSave, initialData = null }: InsuranceHolderFormProps) {
    const [ci, setCi] = useState(initialData?.ci || "")
    const [name, setName] = useState(initialData?.name || "")
    const [phone, setPhone] = useState(initialData?.phone || "")
    const [otherPhone, setOtherPhone] = useState(initialData?.otherPhone || "")
    const [fixedPhone, setFixedPhone] = useState(initialData?.fixedPhone || "")
    const [email, setEmail] = useState(initialData?.email || "")
    const [birthDate, setBirthDate] = useState(initialData?.birthDate || "")
    const [age, setAge] = useState<number | string>(initialData?.age || "")
    const [gender, setGender] = useState(initialData?.gender || "")
    const [address, setAddress] = useState(initialData?.address || "")
    const [city, setCity] = useState(initialData?.city || "")
    const [state, setState] = useState(initialData?.state || "")

    // Insurance fields
    const [clientId, setClientId] = useState(initialData?.clientId || "")
    const [policyNumber, setPolicyNumber] = useState(initialData?.policyNumber || "")
    const [policyType, setPolicyType] = useState(initialData?.policyType || "Individual")
    const [policyStatus, setPolicyStatus] = useState(initialData?.policyStatus || "Activo")
    const [policyStartDate, setPolicyStartDate] = useState(initialData?.policyStartDate || "")
    const [policyEndDate, setPolicyEndDate] = useState(initialData?.policyEndDate || "")
    const [coverageType, setCoverageType] = useState(initialData?.coverageType || "")
    const [maxCoverageAmount, setMaxCoverageAmount] = useState<number | string>(initialData?.maxCoverageAmount || "")

    // Medical fields
    const [emergencyContact, setEmergencyContact] = useState(initialData?.emergencyContact || "")
    const [emergencyPhone, setEmergencyPhone] = useState(initialData?.emergencyPhone || "")
    const [bloodType, setBloodType] = useState(initialData?.bloodType || "")
    const [allergies, setAllergies] = useState(initialData?.allergies || "")
    const [medicalHistory, setMedicalHistory] = useState(initialData?.medicalHistory || "")

    const [createAsPatient, setCreateAsPatient] = useState(!initialData) // Default true for new holders
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

    // State for clients
    const [clients, setClients] = useState<Client[]>([])
    const [loadingClients, setLoadingClients] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)

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

    // Load clients when component mounts
    useEffect(() => {
        const loadClients = async () => {
            setLoadingClients(true)
            try {
                const response = await fetch("/api/clients")
                if (response.ok) {
                    const clientsData = await response.json()
                    setClients(clientsData)

                    // If editing, find and set the selected client
                    if (initialData?.clientId) {
                        const client = clientsData.find((c: Client) => c.id === initialData.clientId)
                        if (client) {
                            setSelectedClient(client)
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading clients:", error)
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los clientes/aseguradoras.",
                    variant: "destructive",
                })
            } finally {
                setLoadingClients(false)
            }
        }

        if (isOpen) {
            loadClients()
        }
    }, [isOpen, initialData?.clientId, toast])

    useEffect(() => {
        if (initialData) {
            setCi(initialData.ci)
            setName(initialData.name)
            setPhone(initialData.phone)
            setOtherPhone(initialData.otherPhone || "")
            setFixedPhone(initialData.fixedPhone || "")
            setEmail(initialData.email || "")
            setBirthDate(initialData.birthDate || "")
            setAge(initialData.age || "")
            setGender(initialData.gender || "")
            setAddress(initialData.address || "")
            setCity(initialData.city || "")
            setState(initialData.state || "")
            setClientId(initialData.clientId || "")
            setPolicyNumber(initialData.policyNumber || "")
            setPolicyType(initialData.policyType || "Individual")
            setPolicyStatus(initialData.policyStatus || "Activo")
            setPolicyStartDate(initialData.policyStartDate || "")
            setPolicyEndDate(initialData.policyEndDate || "")
            setCoverageType(initialData.coverageType || "")
            setMaxCoverageAmount(initialData.maxCoverageAmount || "")
            setEmergencyContact(initialData.emergencyContact || "")
            setEmergencyPhone(initialData.emergencyPhone || "")
            setBloodType(initialData.bloodType || "")
            setAllergies(initialData.allergies || "")
            setMedicalHistory(initialData.medicalHistory || "")
            setIsActive(initialData.isActive ?? true)
            setCreateAsPatient(false) // Don't create as patient when editing
        } else {
            // Reset form for new holder
            setCi("")
            setName("")
            setPhone("")
            setOtherPhone("")
            setFixedPhone("")
            setEmail("")
            setBirthDate("")
            setAge("")
            setGender("")
            setAddress("")
            setCity("")
            setState("")
            setClientId("")
            setPolicyNumber("")
            setPolicyType("Individual")
            setPolicyStatus("Activo")
            setPolicyStartDate("")
            setPolicyEndDate("")
            setCoverageType("")
            setMaxCoverageAmount("")
            setEmergencyContact("")
            setEmergencyPhone("")
            setBloodType("")
            setAllergies("")
            setMedicalHistory("")
            setIsActive(true)
            setCreateAsPatient(true)
            setSelectedClient(null)
        }
    }, [initialData])

    const handleClientChange = (selectedClientId: string) => {
        setClientId(selectedClientId)
        const client = clients.find((c) => c.id === selectedClientId)
        setSelectedClient(client || null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!ci || !name || !phone || !clientId) {
            toast({
                title: "Error",
                description: "Por favor, complete todos los campos requeridos (CI, nombre, teléfono, aseguradora).",
                variant: "destructive",
            })
            return
        }

        const holderData = {
            ci,
            name,
            phone,
            otherPhone: otherPhone || null,
            fixedPhone: fixedPhone || null,
            email: email || null,
            birthDate: birthDate || null,
            age: age ? Number(age) : null,
            gender: gender || null,
            address: address || null,
            city: city || null,
            state: state || null,
            clientId,
            policyNumber: policyNumber || null,
            policyType,
            policyStatus,
            policyStartDate: policyStartDate || null,
            policyEndDate: policyEndDate || null,
            coverageType: coverageType || null,
            maxCoverageAmount: maxCoverageAmount ? Number(maxCoverageAmount) : null,
            emergencyContact: emergencyContact || null,
            emergencyPhone: emergencyPhone || null,
            bloodType: bloodType || null,
            allergies: allergies || null,
            medicalHistory: medicalHistory || null,
            isActive,
            createAsPatient: !initialData && createAsPatient, // Only for new holders
        }

        onSave(holderData)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Titular de Seguro" : "Crear Nuevo Titular de Seguro"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ci">Cédula de Identidad *</Label>
                                <Input id="ci" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="V-12345678" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre Completo *</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono Principal *</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="otherPhone">Otro Teléfono</Label>
                                <Input id="otherPhone" value={otherPhone} onChange={(e) => setOtherPhone(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fixedPhone">Teléfono Fijo</Label>
                                <Input id="fixedPhone" value={fixedPhone} onChange={(e) => setFixedPhone(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                                <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="age">Edad</Label>
                                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Género</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Seleccione género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">Estado</Label>
                                <Select value={state} onValueChange={setState}>
                                    <SelectTrigger id="state">
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
                        </CardContent>
                    </Card>

                    {/* Insurance Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información del Seguro</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="clientId">Aseguradora/Cliente *</Label>
                                <Select value={clientId} onValueChange={handleClientChange} disabled={loadingClients}>
                                    <SelectTrigger id="clientId">
                                        <SelectValue placeholder={loadingClients ? "Cargando..." : "Seleccione aseguradora"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name} - {client.insuranceCompany}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedClient && (
                                    <div className="text-sm text-muted-foreground mt-1">Compañía: {selectedClient.insuranceCompany}</div>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="policyNumber">Número de Póliza</Label>
                                <Input id="policyNumber" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="policyType">Tipo de Póliza</Label>
                                <Select value={policyType} onValueChange={setPolicyType}>
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
                                <Select value={policyStatus} onValueChange={setPolicyStatus}>
                                    <SelectTrigger id="policyStatus">
                                        <SelectValue placeholder="Seleccione estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Suspendido">Suspendido</SelectItem>
                                        <SelectItem value="Vencido">Vencido</SelectItem>
                                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="policyStartDate">Fecha de Inicio</Label>
                                <Input
                                    id="policyStartDate"
                                    type="date"
                                    value={policyStartDate}
                                    onChange={(e) => setPolicyStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="policyEndDate">Fecha de Vencimiento</Label>
                                <Input
                                    id="policyEndDate"
                                    type="date"
                                    value={policyEndDate}
                                    onChange={(e) => setPolicyEndDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="coverageType">Tipo de Cobertura</Label>
                                <Select value={coverageType} onValueChange={setCoverageType}>
                                    <SelectTrigger id="coverageType">
                                        <SelectValue placeholder="Seleccione cobertura" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Básico">Básico</SelectItem>
                                        <SelectItem value="Intermedio">Intermedio</SelectItem>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxCoverageAmount">Monto Máximo de Cobertura</Label>
                                <Input
                                    id="maxCoverageAmount"
                                    type="number"
                                    step="0.01"
                                    value={maxCoverageAmount}
                                    onChange={(e) => setMaxCoverageAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Información Médica y de Emergencia</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                                <Input
                                    id="emergencyContact"
                                    value={emergencyContact}
                                    onChange={(e) => setEmergencyContact(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                                <Input id="emergencyPhone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bloodType">Tipo de Sangre</Label>
                                <Select value={bloodType} onValueChange={setBloodType}>
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
                            <div className="grid gap-2">
                                <Label htmlFor="allergies">Alergias</Label>
                                <Textarea id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="medicalHistory">Historial Médico</Label>
                                <Textarea
                                    id="medicalHistory"
                                    value={medicalHistory}
                                    onChange={(e) => setMedicalHistory(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Options */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                                {!initialData && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="createAsPatient"
                                            checked={createAsPatient}
                                            onCheckedChange={(checked) => setCreateAsPatient(Boolean(checked))}
                                        />
                                        <Label htmlFor="createAsPatient">
                                            Crear también como paciente (recomendado para titulares que serán pacientes)
                                        </Label>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                                    />
                                    <Label htmlFor="isActive">Titular Activo</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            {initialData ? "Guardar Cambios" : "Crear Titular"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
