"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState, useMemo } from "react"

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

export default function ClientBaremosPage({ params }: { params: { clientName: string } }) {
  const { clientName } = params
  const [baremos, setBaremos] = useState<Baremo[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    fetchBaremos()
    fetchUserRole()
  }, [clientName])

  const fetchBaremos = async () => {
    try {
      const res = await fetch(`/api/baremos?clientName=${encodeURIComponent(clientName)}`)
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

  const handleToggleActive = async (baremoId: string, procedureIndex: number, currentStatus: boolean) => {
    const updatedBaremos = baremos.map((baremo) => {
      if (baremo.id === baremoId) {
        const updatedProcedures = [...baremo.procedures]
        updatedProcedures[procedureIndex] = {
          ...updatedProcedures[procedureIndex],
          isActive: !currentStatus,
        }
        return { ...baremo, procedures: updatedProcedures }
      }
      return baremo
    })
    setBaremos(updatedBaremos)

    // Persist to API
    const baremoToUpdate = updatedBaremos.find((b) => b.id === baremoId)
    if (baremoToUpdate) {
      try {
        const res = await fetch(`/api/baremos?id=${baremoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ procedures: baremoToUpdate.procedures }),
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
      } catch (error) {
        console.error("Error updating baremo active status:", error)
        // Optionally revert UI state if API call fails
        fetchBaremos()
      }
    }
  }

  const handlePriceChange = async (baremoId: string, procedureIndex: number, newPrice: string) => {
    const price = Number.parseFloat(newPrice)
    if (isNaN(price)) return

    const updatedBaremos = baremos.map((baremo) => {
      if (baremo.id === baremoId) {
        const updatedProcedures = [...baremo.procedures]
        updatedProcedures[procedureIndex] = {
          ...updatedProcedures[procedureIndex],
          cost: price,
        }
        return { ...baremo, procedures: updatedProcedures }
      }
      return baremo
    })
    setBaremos(updatedBaremos)

    // Persist to API
    const baremoToUpdate = updatedBaremos.find((b) => b.id === baremoId)
    if (baremoToUpdate) {
      try {
        const res = await fetch(`/api/baremos?id=${baremoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ procedures: baremoToUpdate.procedures }),
        })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
      } catch (error) {
        console.error("Error updating baremo price:", error)
        // Optionally revert UI state if API call fails
        fetchBaremos()
      }
    }
  }

  const allProcedures = useMemo(() => {
    const procedures: (Procedure & { baremoId: string; baremoName: string })[] = []
    baremos.forEach((baremo) => {
      baremo.procedures.forEach((proc) => {
        procedures.push({ ...proc, baremoId: baremo.id, baremoName: baremo.name })
      })
    })
    return procedures
  }, [baremos])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(allProcedures.map((p) => p.type))
    return ["Todos", ...Array.from(uniqueCategories).sort()]
  }, [allProcedures])

  const filteredProcedures = useMemo(() => {
    let filtered = allProcedures

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => p.type === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    return filtered
  }, [allProcedures, selectedCategory, searchTerm])

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
      <h1 className="text-2xl font-bold">Baremos para {decodeURIComponent(clientName)}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Procedimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Buscar procedimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <ToggleGroup
              type="single"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="flex-wrap justify-start md:justify-end"
            >
              {categories.map((category) => (
                <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`}>
                  {category}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activo</TableHead>
                <TableHead>Requerimiento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio (REF)</TableHead>
                <TableHead>Baremo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcedures.map((procedure, index) => (
                <TableRow key={`${procedure.baremoId}-${procedure.name}-${index}`}>
                  <TableCell>
                    <Checkbox
                      checked={procedure.isActive}
                      onCheckedChange={() =>
                        handleToggleActive(procedure.baremoId, allProcedures.indexOf(procedure), procedure.isActive)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{procedure.name}</TableCell>
                  <TableCell>{procedure.type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={procedure.cost}
                      onChange={(e) =>
                        handlePriceChange(procedure.baremoId, allProcedures.indexOf(procedure), e.target.value)
                      }
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{procedure.baremoName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
