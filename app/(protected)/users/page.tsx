"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserForm } from "@/components/user-form"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch" // Importa Switch

interface User {
  id: string
  email: string
  name: string
  role: string
  assignedStates: string[]
  isActive: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      console.log(data, "ADS")
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleNewUser = () => {
    setEditingUser(undefined)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return
    }
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete user")
      }
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente.",
      })
      fetchUsers() // Refetch users after deletion
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update user status")
      }

      toast({
        title: "Éxito",
        description: `Usuario ${user.isActive ? "deshabilitado" : "habilitado"} correctamente.`,
      })
      fetchUsers() // Refetch users to update the table
    } catch (error: any) {
      console.error("Error toggling user active status:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado del usuario.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleNewUser}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Cargando usuarios...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estados Asignados</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.assignedStates?.join(", ") || "N/A"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user)}
                        aria-label={`Toggle user ${user.name} active status`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSuccess={() => {
              setIsFormOpen(false)
              fetchUsers()
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
