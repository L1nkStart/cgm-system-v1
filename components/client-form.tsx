"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface Client {
    id: string
    name: string
    insuranceCompanyId?: string
    insuranceCompanyName?: string
    rif: string
    address?: string
    phone?: string
    email?: string
    contactPerson?: string
    contactPhone?: string
    contactEmail?: string
    baremoId?: string
    isActive: boolean
    notes?: string
}

interface Baremo {
    id: string
    name: string
    clinicName: string
}

interface InsuranceCompany {
    id: string
    name: string
    rif?: string
}

interface ClientFormProps {
    client?: Client
    onSave: (client: Partial<Client>) => void
    onCancel: () => void
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
    const [name, setName] = useState(client?.name || "")
    const [insuranceCompanyId, setInsuranceCompanyId] = useState(client?.insuranceCompanyId || "none")
    const [rif, setRif] = useState(client?.rif || "")
    const [address, setAddress] = useState(client?.address || "")
    const [phone, setPhone] = useState(client?.phone || "")
    const [email, setEmail] = useState(client?.email || "")
    const [contactPerson, setContactPerson] = useState(client?.contactPerson || "")
    const [contactPhone, setContactPhone] = useState(client?.contactPhone || "")
    const [contactEmail, setContactEmail] = useState(client?.contactEmail || "")
    const [baremoId, setBaremoId] = useState(client?.baremoId || "none")
    const [isActive, setIsActive] = useState(client?.isActive ?? true)
    const [notes, setNotes] = useState(client?.notes || "")
    const [baremos, setBaremos] = useState<Baremo[]>([])
    const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const { toast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch baremos
                const baremosResponse = await fetch("/api/baremos")
                if (baremosResponse.ok) {
                    const baremosData = await baremosResponse.json()
                    setBaremos(baremosData)
                }

                // Fetch insurance companies
                const insuranceResponse = await fetch("/api/insurance-companies")
                if (insuranceResponse.ok) {
                    const insuranceData = await insuranceResponse.json()
                    setInsuranceCompanies(insuranceData)
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al cargar los datos",
                    variant: "destructive",
                })
            }
        }
        fetchData()
    }, [toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim() || !rif.trim()) {
            toast({
                title: "Error",
                description: "Nombre y RIF son campos requeridos",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        const clientData = {
            name: name.trim(),
            insuranceCompanyId: insuranceCompanyId === "none" ? null : insuranceCompanyId,
            rif: rif.trim(),
            address: address.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            contactPerson: contactPerson.trim() || null,
            contactPhone: contactPhone.trim() || null,
            contactEmail: contactEmail.trim() || null,
            baremoId: baremoId === "none" ? null : baremoId,
            isActive,
            notes: notes.trim() || null,
        }

        try {
            await onSave(clientData)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Cliente *</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Clínica San Rafael"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="insuranceCompanyId">Compañía de Seguros</Label>
                    <Select value={insuranceCompanyId} onValueChange={setInsuranceCompanyId}>
                        <SelectTrigger id="insuranceCompanyId">
                            <SelectValue placeholder="Seleccione una compañía" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin compañía asignada</SelectItem>
                            {insuranceCompanies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.name} {company.rif && `(${company.rif})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="rif">RIF *</Label>
                    <Input
                        id="rif"
                        value={rif}
                        onChange={(e) => setRif(e.target.value)}
                        placeholder="Ej: J-12345678-9"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono Principal</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 0212-1234567" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ej: contacto@clinica.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactPerson">Persona de Contacto</Label>
                    <Input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Ej: Dr. Juan Pérez"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                    <Input
                        id="contactPhone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Ej: 0414-1234567"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contacto</Label>
                    <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Ej: juan.perez@clinica.com"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="baremoId">Baremo Asignado</Label>
                    <Select value={baremoId} onValueChange={setBaremoId}>
                        <SelectTrigger id="baremoId">
                            <SelectValue placeholder="Seleccione un baremo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin baremo asignado</SelectItem>
                            {baremos.map((baremo) => (
                                <SelectItem key={baremo.id} value={baremo.id}>
                                    {baremo.name} - {baremo.clinicName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dirección completa de la empresa"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Información adicional sobre el cliente"
                    rows={3}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Cliente Activo</Label>
            </div>

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : client ? "Actualizar Cliente" : "Crear Cliente"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    )
}
