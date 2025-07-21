"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Definimos la interfaz para los datos del usuario, incluyendo el ID para edición
interface UserData {
  id?: string // Opcional para nuevos usuarios
  email: string
  name: string // Añadido el campo name
  role: string
  password?: string
}

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: UserData | null // Ahora incluye 'name' y 'id'
}

export function UserForm({ isOpen, onClose, initialData }: UserFormProps) {
  const [email, setEmail] = useState(initialData?.email || "")
  const [name, setName] = useState(initialData?.name || "") // Estado para el nombre
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(initialData?.role || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Sincronizar el estado local con initialData cuando cambie
  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email)
      setName(initialData.name)
      setRole(initialData.role)
      setPassword("********") // No precargar la contraseña por seguridad
    } else {
      setEmail("")
      setName("")
      setPassword("")
      setRole("")
    }
  }, [initialData])

  const roles = ["Superusuario", "Coordinador Regional", "Analista Concertado", "Médico Auditor", "Jefe Financiero"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!email || !name || !role || (!initialData && !password)) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos requeridos.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      let response
      const userDataToSave: Partial<UserData> = { email, name, role }

      if (initialData) {
        // Es una edición
        if (password) {
          userDataToSave.password = password
        }
        response = await fetch(`/api/users?id=${initialData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDataToSave),
        })
      } else {
        // Es un nuevo usuario
        userDataToSave.password = password
        response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDataToSave),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save user")
      }

      toast({
        title: "Éxito",
        description: `Usuario ${initialData ? "actualizado" : "creado"} correctamente.`,
      })
      onClose() // Cierra el diálogo y dispara el re-fetch en el padre
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el usuario.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              required
              disabled={!!initialData} // Deshabilitar edición de email para usuarios existentes
            />
          </div>
          {/* Mostrar campo de contraseña solo para nuevos usuarios o si se desea cambiar en edición */}
          {!initialData || (initialData && password) ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required={!initialData} // Requerida solo para nuevos usuarios
                placeholder={initialData ? "Dejar en blanco para no cambiar" : ""}
              />
            </div>
          ) : null}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rol
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
