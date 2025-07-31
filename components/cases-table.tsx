"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Edit, Trash2, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface Case {
  id: string
  client: string
  date: string
  sinisterNo: string
  patientName: string
  ciPatient: string
  patientPhone: string
  assignedAnalystName: string
  status: string
  state: string
  city: string
  baremoName: string
  clinicCost: number
  cgmServiceCost: number
  totalInvoiceAmount: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCases: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CasesTableProps {
  analystId?: string
  statusFilter?: string
  statesFilter?: string
}

export function CasesTable({ analystId, statusFilter, statesFilter }: CasesTableProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCases: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const { toast } = useToast()

  const fetchCases = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (analystId) params.append("analystId", analystId)
      if (statusFilter) params.append("status", statusFilter)
      if (statesFilter) params.append("states", statesFilter)

      const response = await fetch(`/api/cases?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch cases")
      }

      const data = await response.json()
      setCases(data.cases || [])
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCases: 0,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      )
    } catch (error) {
      console.error("Error fetching cases:", error)
      toast({
        title: "Error",
        description: "Failed to fetch cases",
        variant: "destructive",
      })
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases(pagination.currentPage, pagination.limit)
  }, [analystId, statusFilter, statesFilter])

  useEffect(() => {
    const filtered = cases.filter(
      (case_) =>
        case_.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.ciPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.sinisterNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.assignedAnalystName?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCases(filtered)
  }, [cases, searchTerm])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este caso?")) return

    try {
      const response = await fetch(`/api/cases?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete case")
      }

      toast({
        title: "Éxito",
        description: "Caso eliminado correctamente",
      })

      // Refresh the current page
      fetchCases(pagination.currentPage, pagination.limit)
    } catch (error) {
      console.error("Error deleting case:", error)
      toast({
        title: "Error",
        description: "Error al eliminar el caso",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Atendido: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
      "Pendiente por Auditar": "bg-orange-100 text-orange-800",
      Auditado: "bg-purple-100 text-purple-800",
    }

    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Cliente",
      "Fecha",
      "No. Siniestro",
      "Paciente",
      "CI Paciente",
      "Teléfono",
      "Analista",
      "Estado",
      "Estado Geográfico",
      "Ciudad",
      "Baremo",
      "Costo Clínica",
      "Costo CGM",
      "Monto Total",
    ]

    const csvContent = [
      headers.join(","),
      ...cases.map((case_) =>
        [
          case_.id,
          `"${case_.client}"`,
          case_.date,
          case_.sinisterNo,
          `"${case_.patientName}"`,
          case_.ciPatient,
          case_.patientPhone,
          `"${case_.assignedAnalystName}"`,
          `"${case_.status}"`,
          `"${case_.state}"`,
          `"${case_.city}"`,
          `"${case_.baremoName}"`,
          case_.clinicCost || 0,
          case_.cgmServiceCost || 0,
          case_.totalInvoiceAmount || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `casos_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCases(newPage, pagination.limit)
    }
  }

  const handleLimitChange = (newLimit: string) => {
    const limit = Number.parseInt(newLimit)
    fetchCases(1, limit) // Reset to first page when changing limit
  }

  const getPageInfo = () => {
    const start = (pagination.currentPage - 1) * pagination.limit + 1
    const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalCases)
    return `${start} a ${end} de ${pagination.totalCases} casos`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Casos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Cargando casos...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Casos ({pagination.totalCases})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Input
            placeholder="Buscar por paciente, CI, siniestro, cliente o analista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="30">30 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>No. Siniestro</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Analista</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estado Geo.</TableHead>
                <TableHead>Baremo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    No se encontraron casos
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((case_) => (
                  <TableRow key={case_.id}>
                    <TableCell>{case_.date}</TableCell>
                    <TableCell className="font-mono text-sm">{case_.sinisterNo}</TableCell>
                    <TableCell className="font-medium">{case_.patientName}</TableCell>
                    <TableCell>{case_.ciPatient}</TableCell>
                    <TableCell>{case_.client}</TableCell>
                    <TableCell>{case_.assignedAnalystName}</TableCell>
                    <TableCell>{getStatusBadge(case_.status)}</TableCell>
                    <TableCell>{case_.state}</TableCell>
                    <TableCell>{case_.baremoName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/cases/${case_.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/cases/${case_.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(case_.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">{getPageInfo()}</div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-sm">Página</span>
              <span className="text-sm font-medium">
                {pagination.currentPage} de {pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
