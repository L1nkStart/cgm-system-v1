"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface Baremo {
    id: string
    name: string
    clinicName: string
}

interface Client {
    id: string
    name: string
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

interface ClientFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    initialData?: Client | null
}

export function ClientForm({ isOpen, onClose, onSave, initialData = null }: ClientFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        rif: "",
        address: "",
        phone: "",
        email: "",
        contactPerson: "",
        contactPhone: "",
        contactEmail: "",
        baremoId: "",
        isActive: true,
        notes: "",
    })
    const [baremos, setBaremos] = useState<Baremo[]>([])
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                rif: initialData.rif || "",
                address: initialData.address || "",
                phone: initialData.phone || "",
                email: initialData.email || "",
                contactPerson: initialData.contactPerson || "",
                contactPhone: initialData.contactPhone || "",
                contactEmail: initialData.contactEmail || "",
                baremoId: initialData.baremoId || "",
                isActive: initialData.isActive ?? true,
                notes: initialData.notes || "",
            })
        } else {
            setFormData({
                name: "",
                rif: "",
                address: "",
                phone: "",
                email: "",
                contactPerson: "",
                contactPhone: "",
                contactEmail: "",
                baremoId: "",
                isActive: true,
                notes: "",
            })
        }
    }, [initialData])

    useEffect(() => {
        if (isOpen) {
            fetchBaremos()
        }
    }, [isOpen])

    const fetchBaremos = async () => {
        try {
            const response = await fetch("/api/baremos")
            if (response.ok) {
                const data = await response.json()
                setBaremos(data)
            }
        } catch (error) {
            console.error("Error fetching baremos:", error)
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.rif.trim()) {
            toast({
                title: "Error",
                description: "Nombre y RIF son campos requeridos",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const url = initialData ? `/api/clients?id=${initialData.id}` : "/api/clients"
            const method = initialData ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: result.message,
                    variant: "default",
                })
                onSave()
                onClose()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Error al procesar la solicitud",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error de conexión",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Cliente" : "Crear Nuevo Cliente"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Nombre de la Empresa *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nombre de la empresa"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="rif">RIF *</Label>
                            <Input
                                id="rif"
                                value={formData.rif}
                                onChange={(e) => handleInputChange("rif", e.target.value)}
                                placeholder="J-12345678-9"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="address">Dirección</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            placeholder="Dirección de la empresa"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="0212-1234567"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="empresa@email.com"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-3">Información de Contacto</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="contactPerson">Persona de Contacto</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                                    placeholder="Nombre del contacto"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                                <Input
                                    id="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                                    placeholder="0414-1234567"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="contactEmail">Email de Contacto</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                                placeholder="contacto@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="baremo">Baremo Asignado</Label>
                        <Select value={formData.baremoId} onValueChange={(value) => handleInputChange("baremoId", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar baremo" />
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

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                        />
                        <Label htmlFor="isActive">Cliente Activo</Label>
                    </div>

                    <div>
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            placeholder="Notas adicionales sobre el cliente"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                            {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Cliente"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
