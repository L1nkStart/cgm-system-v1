"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MultiSelect } from "@/components/ui/multi-select"
import { Switch } from "@/components/ui/switch" // Importa el componente Switch

interface UserData {
  id?: string
  email: string
  name: string
  role: string
  password?: string
  assignedStates?: string[]
  isActive?: boolean // Añadido el campo isActive
}

interface UserFormProps {
  user?: UserData
  onSuccess: () => void
  onCancel: () => void
}

const ROLES = [
  "Superusuario",
  "Coordinador Regional",
  "Analista Concertado",
  "Médico Auditor",
  "Jefe Financiero",
  "Administrador",
]

const VENEZUELAN_STATES = [
  "Amazonas",
  "Anzoátegui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolívar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Dependencias Federales",
  "Distrito Capital",
  "Falcón",
  "Guárico",
  "La Guaira",
  "Lara",
  "Mérida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Táchira",
  "Trujillo",
  "Yaracuy",
  "Zulia",
]

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [email, setEmail] = useState(user?.email || "")
  const [name, setName] = useState(user?.name || "")
  const [role, setRole] = useState(user?.role || "")
  const [password, setPassword] = useState("")
  const [assignedStates, setAssignedStates] = useState<string[]>(user?.assignedStates || [])
  const [isActive, setIsActive] = useState(user?.isActive ?? true) // Estado para isActive, por defecto true
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setName(user.name)
      setRole(user.role)
      setAssignedStates(user.assignedStates || [])
      setIsActive(user.isActive ?? true) // Sincroniza isActive
    } else {
      // Resetear para nuevo usuario
      setEmail("")
      setName("")
      setRole("")
      setPassword("")
      setAssignedStates([])
      setIsActive(true)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userData: Partial<UserData> = {
      email,
      name,
      role,
      isActive, // Incluye isActive
    }

    if (password) {
      userData.password = password
    }

    if (role === "Analista Concertado" || role === "Médico Auditor") {
      userData.assignedStates = assignedStates.length > 0 ? assignedStates : []
    } else {
      userData.assignedStates = [] // Asegura que sea un array vacío para otros roles
    }

    try {
      const method = user ? "PUT" : "POST"
      const url = user ? `/api/users?id=${user.id}` : "/api/users"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Something went wrong")
      }

      toast({
        title: "Éxito",
        description: `Usuario ${user ? "actualizado" : "creado"} correctamente.`,
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud.",
        variant: "destructive",
      })
    }
  }

  const handleAssignedStatesChange = (selectedItems: string[]) => {
    setAssignedStates(selectedItems)
  }

  const showAssignedStates = role === "Analista Concertado" || role === "Médico Auditor"

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={setRole} required>
          <SelectTrigger id="role">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showAssignedStates && (
        <div className="grid gap-2">
          <Label htmlFor="assignedStates">Estados Asignados</Label>
          <MultiSelect
            options={VENEZUELAN_STATES.map((state) => ({ label: state, value: state }))}
            selected={assignedStates}
            onSelect={handleAssignedStatesChange}
            placeholder="Selecciona estados"
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="password">{user ? "Nueva Contraseña (opcional)" : "Contraseña"}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!user} // Requerida solo para nuevos usuarios
        />
      </div>
      {user && ( // Solo mostrar el switch de activo/inactivo para usuarios existentes
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="isActive">Activo</Label>
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{user ? "Guardar Cambios" : "Crear Usuario"}</Button>
      </div>
    </form>
  )
}
