"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { InsuranceCompanyForm } from "@/components/insurance-company-form"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, MoreHorizontal, Edit, Building2, Phone, Mail, User } from "lucide-react"

interface InsuranceCompany {
    id: string
    name: string
    rif: string
    phone: string
    email: string
    address: string
    contactPerson: string
    contactPhone: string
    contactEmail: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function InsuranceCompaniesPage() {
    const { toast } = useToast()
    const [companies, setCompanies] = useState<InsuranceCompany[]>([])
    const [filteredCompanies, setFilteredCompanies] = useState<InsuranceCompany[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showInactive, setShowInactive] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null)

    useEffect(() => {
        fetchCompanies()
    }, [showInactive])

    useEffect(() => {
        filterCompanies()
    }, [companies, searchTerm, showInactive])

    const fetchCompanies = async () => {
        try {
            setIsLoading(true)
            const url = `/api/insurance-companies${showInactive ? "?includeInactive=true" : ""}`
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error("Error fetching insurance companies")
            }

            const data = await response.json()
            setCompanies(data)
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

    const filterCompanies = () => {
        let filtered = companies

        if (searchTerm) {
            filtered = filtered.filter(
                (company) =>
                    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    company.rif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    company.email?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        setFilteredCompanies(filtered)
    }

    const handleEdit = (company: InsuranceCompany) => {
        setSelectedCompany(company)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedCompany(null)
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        fetchCompanies()
    }

    const handleToggleActive = async (company: InsuranceCompany) => {
        try {
            const response = await fetch(`/api/insurance-companies/${company.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...company,
                    isActive: !company.isActive,
                }),
            })

            if (!response.ok) {
                throw new Error("Error updating company status")
            }

            toast({
                title: "Éxito",
                description: `Compañía ${company.isActive ? "inactivada" : "activada"} correctamente`,
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

    if (isLoading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Cargando compañías de seguros...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Compañías de Seguros</h1>
                    <p className="text-muted-foreground">Gestiona las compañías de seguros del sistema</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Compañía
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros y Búsqueda</CardTitle>
                    <CardDescription>Busca y filtra las compañías de seguros</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Compañías de Seguros ({filteredCompanies.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredCompanies.length === 0 ? (
                        <div className="text-center py-8">
                            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold">No hay compañías</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {searchTerm
                                    ? "No se encontraron compañías con los criterios de búsqueda"
                                    : "Comienza creando una nueva compañía de seguros"}
                            </p>
                            {!searchTerm && (
                                <Button onClick={handleCreate} className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nueva Compañía
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Compañía</TableHead>
                                        <TableHead>RIF</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Información</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="w-[70px]">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCompanies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{company.name}</div>
                                                    {company.address && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {company.address.length > 50 ? `${company.address.substring(0, 50)}...` : company.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{company.rif || "No especificado"}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {company.contactPerson && (
                                                        <div className="flex items-center text-sm">
                                                            <User className="mr-1 h-3 w-3" />
                                                            {company.contactPerson}
                                                        </div>
                                                    )}
                                                    {company.contactPhone && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Phone className="mr-1 h-3 w-3" />
                                                            {company.contactPhone}
                                                        </div>
                                                    )}
                                                    {company.contactEmail && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Mail className="mr-1 h-3 w-3" />
                                                            {company.contactEmail}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {company.phone && (
                                                        <div className="flex items-center text-sm">
                                                            <Phone className="mr-1 h-3 w-3" />
                                                            {company.phone}
                                                        </div>
                                                    )}
                                                    {company.email && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <Mail className="mr-1 h-3 w-3" />
                                                            {company.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={company.isActive ? "default" : "secondary"}
                                                    className={company.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                                >
                                                    {company.isActive ? "Activa" : "Inactiva"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(company)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleActive(company)}>
                                                            {company.isActive ? "Inactivar" : "Activar"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <InsuranceCompanyForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                company={selectedCompany}
            />
        </div>
    )
}
