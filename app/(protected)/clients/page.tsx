"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ClientForm } from "@/components/client-form"
import { Building2, Search, Plus, Edit, Trash2, Phone, Mail } from "lucide-react"

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
    baremoName?: string
    baremoClinicName?: string
    isActive: boolean
    notes?: string
    created_at: string
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [filteredClients, setFilteredClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchClients()
        fetchUserRole()
    }, [])

    useEffect(() => {
        const filtered = clients.filter(
            (client) =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())),
        )
        setFilteredClients(filtered)
    }, [clients, searchTerm])

    const fetchUserRole = async () => {
        try {
            const response = await fetch("/api/current-user-role")
            if (response.ok) {
                const data = await response.json()
                setUserRole(data.role)
            }
        } catch (error) {
            console.error("Error fetching user role:", error)
        }
    }

    const fetchClients = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/clients")
            if (response.ok) {
                const data = await response.json()
                setClients(data)
            } else {
                toast({
                    title: "Error",
                    description: "Error al cargar los clientes",
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

    const handleEdit = (client: Client) => {
        setEditingClient(client)
        setIsFormOpen(true)
    }

    const handleDelete = async (client: Client) => {
        if (!confirm(`¿Está seguro de que desea eliminar el cliente "${client.name}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/clients?id=${client.id}`, {
                method: "DELETE",
            })

            const result = await response.json()

            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: result.message,
                    variant: "default",
                })
                fetchClients()
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Error al eliminar el cliente",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error de conexión",
                variant: "destructive",
            })
        }
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingClient(null)
    }

    const canManageClients = userRole === "Superusuario" || userRole === "Jefe Financiero"

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Cargando clientes...</div>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6" />
                    <h1 className="font-semibold text-lg md:text-2xl">Gestión de Clientes</h1>
                </div>
                {canManageClients && (
                    <Button onClick={() => setIsFormOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Cliente
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Clientes</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre, RIF o contacto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredClients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empresa</TableHead>
                                        <TableHead>RIF</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Baremo Asignado</TableHead>
                                        <TableHead>Estado</TableHead>
                                        {canManageClients && <TableHead>Acciones</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{client.name}</div>
                                                    {client.address && <div className="text-sm text-gray-500">{client.address}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">{client.rif}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {client.contactPerson && <div className="text-sm font-medium">{client.contactPerson}</div>}
                                                    {client.contactPhone && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Phone className="h-3 w-3" />
                                                            {client.contactPhone}
                                                        </div>
                                                    )}
                                                    {client.contactEmail && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Mail className="h-3 w-3" />
                                                            {client.contactEmail}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {client.baremoName ? (
                                                    <div>
                                                        <div className="font-medium">{client.baremoName}</div>
                                                        <div className="text-sm text-gray-500">{client.baremoClinicName}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Sin baremo asignado</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={client.isActive ? "default" : "secondary"}>
                                                    {client.isActive ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            {canManageClients && (
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {userRole === "Superusuario" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(client)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {searchTerm
                                    ? "No se encontraron clientes que coincidan con la búsqueda"
                                    : "No hay clientes registrados"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isFormOpen && (
                <ClientForm isOpen={isFormOpen} onClose={handleFormClose} onSave={fetchClients} initialData={editingClient} />
            )}
        </main>
    )
}
