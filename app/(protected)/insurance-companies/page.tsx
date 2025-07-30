"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { InsuranceCompanyForm } from "@/components/insurance-company-form"
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"

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
    createdAt: string
    updatedAt: string
}

export default function InsuranceCompaniesPage() {
    const [companies, setCompanies] = useState<InsuranceCompany[]>([])
    const [filteredCompanies, setFilteredCompanies] = useState<InsuranceCompany[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [showInactive, setShowInactive] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | undefined>()

    const { toast } = useToast()

    const fetchCompanies = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/insurance-companies?includeInactive=${showInactive}`)
            if (!response.ok) throw new Error("Failed to fetch companies")
            const data = await response.json()
            setCompanies(data)
            setFilteredCompanies(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al cargar las compañías de seguros",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCompanies()
    }, [showInactive])

    useEffect(() => {
        const filtered = companies.filter(
            (company) =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.rif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.email?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setFilteredCompanies(filtered)
    }, [searchTerm, companies])

    const handleSave = async (companyData: Partial<InsuranceCompany>) => {
        try {
            const url = selectedCompany ? `/api/insurance-companies/${selectedCompany.id}` : "/api/insurance-companies"
            const method = selectedCompany ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(companyData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Error al guardar")
            }

            toast({
                title: "Éxito",
                description: result.message,
            })

            setIsDialogOpen(false)
            setSelectedCompany(undefined)
            fetchCompanies()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleDelete = async (company: InsuranceCompany) => {
        if (!confirm(`¿Está seguro de que desea eliminar la compañía "${company.name}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/insurance-companies/${company.id}`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Error al eliminar")
            }

            toast({
                title: "Éxito",
                description: result.message,
            })

            fetchCompanies()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const openCreateDialog = () => {
        setSelectedCompany(undefined)
        setIsDialogOpen(true)
    }

    const openEditDialog = (company: InsuranceCompany) => {
        setSelectedCompany(company)
        setIsDialogOpen(true)
    }

    if (isLoading) {
        return <div>Cargando...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Compañías de Seguros</h1>
                    <p className="text-muted-foreground">Gestiona las compañías de seguros del sistema</p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Compañía
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Compañías Registradas ({filteredCompanies.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar por nombre, RIF o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                            <Label htmlFor="show-inactive">Mostrar inactivas</Label>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{company.name}</h3>
                                        <Badge variant={company.isActive ? "default" : "secondary"}>
                                            {company.isActive ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        {company.rif && <p>RIF: {company.rif}</p>}
                                        {company.phone && <p>Teléfono: {company.phone}</p>}
                                        {company.email && <p>Email: {company.email}</p>}
                                        {company.contactPerson && <p>Contacto: {company.contactPerson}</p>}
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEditDialog(company)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(company)} className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>

                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">No se encontraron compañías de seguros</div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedCompany ? "Editar Compañía" : "Nueva Compañía de Seguros"}</DialogTitle>
                    </DialogHeader>
                    <InsuranceCompanyForm company={selectedCompany} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
