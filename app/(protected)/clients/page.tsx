"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { ClientForm } from "@/components/client-form"
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail } from "lucide-react"

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
    insuranceCompanyId?: string
    isActive: boolean
    notes?: string
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [filteredClients, setFilteredClients] = useState<Client[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [userRole, setUserRole] = useState<string>("")

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
        try {
            setIsLoading(true)
            const response = await fetch("/api/clients")
            if (!response.ok) throw new Error("Failed to fetch clients")
            const data = await response.json()
            setClients(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al cargar los clientes",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveClient = async (clientData: Partial<Client>) => {
        try {
            const url = editingClient ? `/api/clients?id=${editingClient.id}` : "/api/clients"
            const method = editingClient ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clientData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Error al guardar el cliente")
            }

            toast({
                title: "Éxito",
                description: editingClient ? "Cliente actualizado correctamente" : "Cliente creado correctamente",
            })

            setIsDialogOpen(false)
            setEditingClient(null)
            fetchClients()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const handleDeleteClient = async (client: Client) => {
        if (!confirm(`¿Está seguro de eliminar el cliente "${client.name}"?`)) return

        try {
            const response = await fetch(`/api/clients?id=${client.id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Error al eliminar el cliente")
            }

            toast({
                title: "Éxito",
                description: "Cliente eliminado correctamente",
            })

            fetchClients()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const canManageClients = userRole === "Superusuario" || userRole === "Jefe Financiero"

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando clientes...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-semibold text-lg md:text-2xl">Gestión de Clientes</h1>
                    <p className="text-gray-600">Administre los clientes y sus baremos asignados</p>
                </div>
                {canManageClients && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingClient(null)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Cliente
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingClient ? "Editar Cliente" : "Crear Nuevo Cliente"}</DialogTitle>
                            </DialogHeader>
                            <ClientForm
                                client={editingClient || undefined}
                                onSave={handleSaveClient}
                                onCancel={() => {
                                    setIsDialogOpen(false)
                                    setEditingClient(null)
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <CardTitle>Lista de Clientes</CardTitle>
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Buscar por nombre, RIF o contacto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
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
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <div className="font-medium">{client.name}</div>
                                                    {client.address && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{client.address}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono">{client.rif}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {client.contactPerson && <div className="text-sm font-medium">{client.contactPerson}</div>}
                                                {client.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3" />
                                                        {client.phone}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Mail className="h-3 w-3" />
                                                        {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {client.baremoName ? (
                                                <div>
                                                    <div className="font-medium text-sm">{client.baremoName}</div>
                                                    <div className="text-xs text-gray-500">{client.baremoClinicName}</div>
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
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingClient(client)
                                                            setIsDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {userRole === "Superusuario" && (
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client)}>
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
                    {filteredClients.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? "No se encontraron clientes que coincidan con la búsqueda" : "No hay clientes registrados"}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
