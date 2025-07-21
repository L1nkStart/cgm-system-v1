"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Pencil, Trash2, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BaremoForm } from "@/components/baremo-form"

interface Procedure {
  name: string
  cost: number
  isActive: boolean
  type: string
}

interface Baremo {
  id: string
  name: string
  clinicName: string
  effectiveDate: string
  procedures: Procedure[]
}

export default function BaremosPage() {
  const [baremos, setBaremos] = useState<Baremo[]>([])
  // Simplificamos el manejo de isFormOpen, dejaremos que DialogTrigger lo maneje,
  // pero lo mantenemos para controlar el onClose.
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBaremo, setEditingBaremo] = useState<Baremo | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchBaremos()
    fetchUserRole()
  }, [])

  const fetchBaremos = async () => {
    try {
      const res = await fetch("/api/baremos")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data: Baremo[] = await res.json()
      setBaremos(data)
    } catch (error) {
      console.error("Error fetching baremos:", error)
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

  // Esta función se llamará cuando el diálogo se cierre (o se intente abrir/cerrar).
  // Solo realizamos acciones si el diálogo *está* cerrándose.
  const handleDialogChange = (open: boolean) => {
    setIsFormOpen(open); // Actualiza el estado local para reflejar si el diálogo está abierto o cerrado
    if (!open) { // Si el diálogo se está cerrando
      setEditingBaremo(null); // Limpiar el baremo en edición
      fetchBaremos(); // Refrescar la lista de baremos
    }
  }

  const handleDeleteBaremo = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este baremo?")) {
      try {
        const res = await fetch(`/api/baremos?id=${id}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        fetchBaremos() // Refresh the list
      } catch (error) {
        console.error("Error deleting baremo:", error)
      }
    }
  }

  const handleEditClick = (baremo: Baremo) => {
    setEditingBaremo(baremo)
    setIsFormOpen(true) // Abre el diálogo al hacer clic en editar
  }

  // Esta función es para el botón "Nuevo Baremo"
  const handleNewBaremoClick = () => {
    setEditingBaremo(null) // Asegurarse de que no haya baremo en edición
    // NO es necesario llamar a setIsFormOpen(true) aquí
    // porque DialogTrigger se encarga de abrir el diálogo
    // cuando se hace clic en el botón que lo envuelve.
    // Solo necesitamos asegurarnos de que el `editingBaremo` esté limpio.
  }


  const allowedRoles = ["Superusuario", "Coordinador Regional"]

  if (userRole === null) {
    return <div className="flex items-center justify-center min-h-[60vh]">Cargando permisos...</div>
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500">Acceso denegado. No tienes permisos para ver esta página.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Baremos</h1>
        {/* Cambiamos onOpenChange a handleDialogChange */}
        <Dialog open={isFormOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            {/* onCLick en el botón para resetear editingBaremo */}
            <Button onClick={handleNewBaremoClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Baremo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBaremo ? "Editar Baremo" : "Crear Nuevo Baremo"}</DialogTitle>
            </DialogHeader>
            {/* Pasamos isFormOpen al BaremoForm si lo necesita para su lógica interna */}
            <BaremoForm isOpen={isFormOpen} onSave={() => setIsFormOpen(false)} onClose={() => setIsFormOpen(false)} initialData={editingBaremo} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Baremos</CardTitle>
          <CardDescription>Gestiona los baremos de procedimientos y costos por clínica.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Clínica/Cliente</TableHead>
                <TableHead>Fecha Efectiva</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baremos.map((baremo) => (
                <TableRow key={baremo.id}>
                  <TableCell className="font-medium">{baremo.name}</TableCell>
                  <TableCell>{baremo.clinicName}</TableCell>
                  <TableCell>{baremo.effectiveDate}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/baremos/client/${baremo.clinicName}`} passHref>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(baremo)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBaremo(baremo.id)}>
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