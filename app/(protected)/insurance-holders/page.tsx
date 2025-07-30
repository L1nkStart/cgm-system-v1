"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { InsuranceHolderForm } from "@/components/insurance-holder-form"
import { Search, Shield, Users, FileText, Edit, Trash2, Plus } from "lucide-react"

interface InsuranceHolder {
    id: string
    ci: string
    name: string
    phone: string
    email?: string
    policyNumber?: string
    insuranceCompany?: string
    policyType?: string
    policyStatus?: string
    coverageType?: string
    maxCoverageAmount?: number
    usedCoverageAmount?: number
    totalCases: number
    totalPatients: number
    isActive: boolean
}

export default function InsuranceHoldersPage() {
    const [holders, setHolders] = useState<InsuranceHolder[]>([])
    const [filteredHolders, setFilteredHolders] = useState<InsuranceHolder[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingHolder, setEditingHolder] = useState<InsuranceHolder | null>(null)
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchHolders = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch("/api/insurance-holders")
            if (!response.ok) {
                throw new Error(`Failed to fetch insurance holders: ${response.statusText}`)
            }
            const data = await response.json()
            setHolders(data)
            setFilteredHolders(data)
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.")
            toast({
                title: "Error",
                description: err.message || "Failed to load insurance holders.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchCurrentUserRole = async () => {
        try {
            const response = await fetch("/api/current-user-role")
            if (response.ok) {
                const data = await response.json()
                setCurrentUserRole(data.role || null)
            }
        } catch (error) {
            console.error("Error fetching user role:", error)
        }
    }

    useEffect(() => {
        fetchHolders()
        fetchCurrentUserRole()
    }, [])

    useEffect(() => {
        const filtered = holders.filter(
            (holder) =>
                holder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                holder.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
                holder.phone.includes(searchTerm) ||
                (holder.email && holder.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (holder.policyNumber && holder.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        setFilteredHolders(filtered)
    }, [searchTerm, holders])

    const handleCreateHolder = async (newHolderData: any) => {
        try {
            const response = await fetch("/api/insurance-holders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newHolderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro creado correctamente.",
                variant: "default",
            })
            fetchHolders()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al crear el titular de seguro.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateHolder = async (updatedHolderData: any) => {
        if (!editingHolder) return

        try {
            const response = await fetch(`/api/insurance-holders?id=${editingHolder.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedHolderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro actualizado correctamente.",
                variant: "default",
            })
            fetchHolders()
            setEditingHolder(null)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al actualizar el titular de seguro.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteHolder = async (id: string) => {
        if (!confirm("¿Está seguro de que desea eliminar este titular de seguro?")) return

        try {
            const response = await fetch(`/api/insurance-holders?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to delete insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro eliminado correctamente.",
                variant: "default",
            })
            fetchHolders()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al eliminar el titular de seguro.",
                variant: "destructive",
            })
        }
    }

    const openEditForm = (holder: InsuranceHolder) => {
        setEditingHolder(holder)
        setIsFormOpen(true)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingHolder(null)
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "activo":
                return "bg-green-100 text-green-800 border-green-200"
            case "suspendido":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "vencido":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "cancelado":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return "N/A"
        return new Intl.NumberFormat("es-VE", {
            style: "currency",
            currency: "USD",
        }).format(amount)
    }

    const canManageHolders = currentUserRole === "Superusuario" || currentUserRole === "Coordinador Regional"

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando titulares de seguro...</div>
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-lg md:text-2xl">Titulares de Seguro</h1>
                    <p className="text-muted-foreground">Gestión de titulares de pólizas de seguro</p>
                </div>
                {canManageHolders && (
                    <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Titular
                    </Button>
                )}
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar por nombre, cédula, teléfono, email o número de póliza..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Titulares</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredHolders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pólizas Activas</CardTitle>
                        <Shield className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredHolders.filter((h) => h.policyStatus === "Activo").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredHolders.reduce((sum, h) => sum + h.totalPatients, 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Casos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredHolders.reduce((sum, h) => sum + h.totalCases, 0)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Holders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Listado de Titulares</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredHolders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titular</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Póliza</TableHead>
                                        <TableHead>Compañía</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Cobertura</TableHead>
                                        <TableHead>Pacientes</TableHead>
                                        <TableHead>Casos</TableHead>
                                        {canManageHolders && <TableHead>Acciones</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHolders.map((holder) => (
                                        <TableRow key={holder.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{holder.name}</div>
                                                    <div className="text-sm text-muted-foreground">{holder.ci}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{holder.phone}</div>
                                                    {holder.email && <div className="text-sm text-muted-foreground">{holder.email}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm font-medium">{holder.policyNumber || "N/A"}</div>
                                                    <div className="text-sm text-muted-foreground">{holder.policyType || "N/A"}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{holder.insuranceCompany || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(holder.policyStatus || "")}>
                                                    {holder.policyStatus || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm font-medium">{holder.coverageType || "N/A"}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatCurrency(holder.maxCoverageAmount)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{holder.totalPatients}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{holder.totalCases}</Badge>
                                            </TableCell>
                                            {canManageHolders && (
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEditForm(holder)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteHolder(holder.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No hay titulares de seguro para mostrar.</p>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            {isFormOpen && (
                <InsuranceHolderForm
                    isOpen={isFormOpen}
                    onClose={handleFormClose}
                    onSave={editingHolder ? handleUpdateHolder : handleCreateHolder}
                    initialData={editingHolder}
                />
            )}
        </main>
    )
}
