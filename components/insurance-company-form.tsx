"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface InsuranceCompany {
    id?: string
    name: string
    rif: string
    phone: string
    email: string
    address: string
    contactPerson: string
    contactPhone: string
    contactEmail: string
    isActive: boolean
}

interface InsuranceCompanyFormProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    company?: InsuranceCompany | null
}

export function InsuranceCompanyForm({ isOpen, onClose, onSuccess, company }: InsuranceCompanyFormProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<InsuranceCompany>({
        name: "",
        rif: "",
        phone: "",
        email: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        contactEmail: "",
        isActive: true,
    })

    useEffect(() => {
        if (company) {
            setFormData(company)
        } else {
            setFormData({
                name: "",
                rif: "",
                phone: "",
                email: "",
                address: "",
                contactPerson: "",
                contactPhone: "",
                contactEmail: "",
                isActive: true,
            })
        }
    }, [company, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const url = company ? `/api/insurance-companies/${company.id}` : "/api/insurance-companies"
            const method = company ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Error saving insurance company")
            }

            toast({
                title: "Éxito",
                description: company
                    ? "Compañía de seguros actualizada correctamente"
                    : "Compañía de seguros creada correctamente",
            })

            onSuccess()
            onClose()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: keyof InsuranceCompany, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{company ? "Editar Compañía de Seguros" : "Nueva Compañía de Seguros"}</DialogTitle>
                    <DialogDescription>
                        {company
                            ? "Modifica los datos de la compañía de seguros"
                            : "Completa los datos para crear una nueva compañía de seguros"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Compañía *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Ej: Seguros La Previsora"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rif">RIF</Label>
                            <Input
                                id="rif"
                                value={formData.rif}
                                onChange={(e) => handleInputChange("rif", e.target.value)}
                                placeholder="Ej: J-12345678-9"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="Ej: +58 212 123-4567"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="Ej: contacto@seguros.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            placeholder="Dirección completa de la compañía"
                            rows={3}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">Información de Contacto</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                                    placeholder="Nombre del contacto principal"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                                <Input
                                    id="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                                    placeholder="Teléfono directo del contacto"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="contactEmail">Email de Contacto</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                                    placeholder="Email directo del contacto"
                                />
                            </div>
                        </div>
                    </div>

                    {company && (
                        <div className="flex items-center space-x-2 border-t pt-4">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                            />
                            <Label htmlFor="isActive">Compañía Activa</Label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : company ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
