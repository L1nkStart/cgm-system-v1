"use client"

import { UserForm } from "@/components/user-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchUserRole()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: User[] = await res.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/current-user-role")
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.role)
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
      setUserRole(null)
    }
  }

  const handleSaveUser = async () => {
    await fetchUsers() // Refresh the list
    setIsFormOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const res = await fetch(`/api/users?id=${id}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        fetchUsers() // Refresh the list
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleNewUserClick = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  // Solo renderiza si el rol es Superusuario
  if (userRole !== "Superusuario") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500">Acceso denegado. No tienes permisos para ver esta página.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewUserClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <UserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={editingUser ? editingUser : undefined} onSave={handleSaveUser} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Gestiona los usuarios del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(user)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
