"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface InsuranceCompany {
    id: string
    name: string
    rif?: string
    address?: string
    phone?: string
    email?: string
    contactPerson?: string
    contactPhone?: string
    contactEmail?: string
    isActive: boolean
    notes?: string
}

interface InsuranceCompanyFormProps {
    company?: InsuranceCompany
    onSave: (company: Partial<InsuranceCompany>) => void
    onCancel: () => void
}

export function InsuranceCompanyForm({ company, onSave, onCancel }: InsuranceCompanyFormProps) {
    const [name, setName] = useState(company?.name || "")
    const [rif, setRif] = useState(company?.rif || "")
    const [address, setAddress] = useState(company?.address || "")
    const [phone, setPhone] = useState(company?.phone || "")
    const [email, setEmail] = useState(company?.email || "")
    const [contactPerson, setContactPerson] = useState(company?.contactPerson || "")
    const [contactPhone, setContactPhone] = useState(company?.contactPhone || "")
    const [contactEmail, setContactEmail] = useState(company?.contactEmail || "")
    const [isActive, setIsActive] = useState(company?.isActive ?? true)
    const [notes, setNotes] = useState(company?.notes || "")
    const [isLoading, setIsLoading] = useState(false)

    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast({
                title: "Error",
                description: "El nombre es un campo requerido",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        const companyData = {
            name: name.trim(),
            rif: rif.trim() || null,
            address: address.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            contactPerson: contactPerson.trim() || null,
            contactPhone: contactPhone.trim() || null,
            contactEmail: contactEmail.trim() || null,
            isActive,
            notes: notes.trim() || null,
        }

        try {
            await onSave(companyData)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Compañía *</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Seguros Universales"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="rif">RIF</Label>
                    <Input id="rif" value={rif} onChange={(e) => setRif(e.target.value)} placeholder="Ej: J-12345678-9" />
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
                        placeholder="Ej: contacto@seguros.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactPerson">Persona de Contacto</Label>
                    <Input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Ej: Lic. María González"
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

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contactEmail">Email de Contacto</Label>
                    <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Ej: maria.gonzalez@seguros.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dirección completa de la compañía"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Información adicional sobre la compañía"
                    rows={3}
                />
            </div>

            {company && (
                <div className="flex items-center space-x-2">
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="isActive">Compañía Activa</Label>
                </div>
            )}

            <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Guardando..." : company ? "Actualizar Compañía" : "Crear Compañía"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    )
}
