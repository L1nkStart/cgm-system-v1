"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, X, DollarSign } from "lucide-react"

interface Procedure {
    name: string
    code: string // Ensure code is always a string
    price: number | null // Allow price to be null or undefined
    isActive?: boolean // Optional, depends on your API data
    type?: string // Optional, depends on your API data
}

interface Service {
    name: string
    type: string
    amount: number
    attended: boolean
}

interface ProcedureSelectorProps {
    baremoId: string
    onServicesChange: (services: Service[]) => void
    initialServices?: Service[]
}

export function ProcedureSelector({ baremoId, onServicesChange, initialServices = [] }: ProcedureSelectorProps) {
    const [procedures, setProcedures] = useState<Procedure[]>([])
    const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedServices, setSelectedServices] = useState<Service[]>(initialServices)
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)
    const [serviceType, setServiceType] = useState("CONSULTA") // Default service type
    const [customAmount, setCustomAmount] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    // Effect to fetch procedures when baremoId changes
    useEffect(() => {
        if (baremoId) {
            fetchProcedures()
        } else {
            setProcedures([])
            setFilteredProcedures([])
            setSelectedServices([])
            setSelectedProcedure(null)
            // Optionally show a toast if baremoId is missing but expected
            // toast({
            //     title: "Información",
            //     description: "Seleccione un cliente con un baremo asignado.",
            //     variant: "default",
            // });
        }
    }, [baremoId])

    // Effect to filter procedures based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredProcedures(procedures)
        } else {
            const filtered = procedures.filter(
                (proc) =>
                    (proc.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) || // Safely access name
                    (proc.code ?? "").toLowerCase().includes(searchTerm.toLowerCase()), // Safely access code
            )
            setFilteredProcedures(filtered)
        }
    }, [searchTerm, procedures])

    // Effect to notify parent component about changes in selected services
    useEffect(() => {
        onServicesChange(selectedServices)
    }, [selectedServices, onServicesChange])

    const fetchProcedures = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/baremos?id=${baremoId}`)
            if (!response.ok) {
                throw new Error("Failed to fetch baremo procedures")
            }
            const baremoData = await response.json()

            // Ensure procedures is an array and each procedure has name and code
            const rawProcedures = baremoData.procedures || []
            const processedProcedures: Procedure[] = rawProcedures
                .map((p: any) => ({
                    name: p.name || "Sin nombre", // Default value if name is missing
                    code: p.code || "N/A", // Default value if code is missing
                    price: p.price ?? null, // Use price from API, fallback to null
                    isActive: p.isActive ?? true, // Default to true if isActive is missing
                    type: p.type || "CONSULTA", // Default type if missing
                }))
                .filter((p: Procedure) => p.isActive) // Filter for active procedures only

            setProcedures(processedProcedures)
            setFilteredProcedures(processedProcedures)
        } catch (error: any) {
            console.error("Error fetching baremo procedures:", error)
            toast({
                title: "Error",
                description: error.message || "Error al cargar los procedimientos del baremo.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleProcedureSelect = (procedure: Procedure) => {
        setSelectedProcedure(procedure)
        // Set custom amount to procedure's price if available, otherwise empty
        setCustomAmount(procedure.price != null ? procedure.price.toString() : "")
        setServiceType(procedure.type || "CONSULTA") // Set service type from procedure, default to CONSULTA
    }

    const addService = () => {
        if (!selectedProcedure) {
            toast({
                title: "Error",
                description: "Seleccione un procedimiento antes de agregar.",
                variant: "destructive",
            })
            return
        }

        const amount = Number(customAmount)
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: "Error",
                description: "Ingrese un monto válido para el procedimiento.",
                variant: "destructive",
            })
            return
        }

        // Check if a service with the exact name and type already exists
        const existingService = selectedServices.find(
            (service) => service.name === selectedProcedure.name && service.type === serviceType,
        )

        if (existingService) {
            toast({
                title: "Advertencia",
                description: `El procedimiento "${selectedProcedure.name}" con tipo "${serviceType}" ya ha sido agregado.`,
                variant: "default",
            })
            return
        }

        const newService: Service = {
            name: selectedProcedure.name,
            type: serviceType,
            amount: amount,
            attended: false, // Default to not attended
        }

        setSelectedServices((prevServices) => [...prevServices, newService])
        setSelectedProcedure(null) // Clear selected procedure after adding
        setCustomAmount("") // Clear custom amount
        setSearchTerm("") // Clear search term
        setServiceType("CONSULTA") // Reset service type

        toast({
            title: "Procedimiento agregado",
            description: `${newService.name} (${newService.type}) por $${newService.amount.toFixed(2)} agregado correctamente.`,
            variant: "default",
        })
    }

    const removeService = (index: number) => {
        const serviceToRemove = selectedServices[index]
        setSelectedServices((prevServices) => prevServices.filter((_, i) => i !== index))
        toast({
            title: "Procedimiento eliminado",
            description: `${serviceToRemove.name} (${serviceToRemove.type}) eliminado correctamente.`,
            variant: "default",
        })
    }

    const getTotalAmount = () => {
        return selectedServices.reduce((total, service) => total + service.amount, 0)
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Procedimientos del Baremo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-gray-500">Cargando procedimientos...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Procedimientos del Baremo
                    {selectedServices.length > 0 && (
                        <Badge variant="secondary">
                            {selectedServices.length} procedimiento{selectedServices.length !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search and Add Section */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar procedimientos por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Procedures List (visible when searching) */}
                    {searchTerm.trim() !== "" && (
                        <div className="max-h-48 overflow-y-auto border rounded-md">
                            {filteredProcedures.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No se encontraron procedimientos.</div>
                            ) : (
                                <div className="space-y-1 p-2">
                                    {filteredProcedures.map((procedure, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded cursor-pointer hover:bg-gray-50 border ${selectedProcedure?.code === procedure.code ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                                }`}
                                            onClick={() => handleProcedureSelect(procedure)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-sm">{procedure.name}</div>
                                                    <div className="text-xs text-gray-500">Código: {procedure.code}</div>
                                                </div>
                                                <div className="text-sm font-medium text-green-600">
                                                    {procedure.price != null ? `$${procedure.price.toFixed(2)}` : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add Service Form (visible when a procedure is selected) */}
                    {selectedProcedure && (
                        <div className="border rounded-md p-4 bg-blue-50">
                            <h4 className="font-medium mb-3">Agregar Procedimiento al Caso</h4>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">Procedimiento Seleccionado</Label>
                                    <div className="text-sm text-gray-600">
                                        {selectedProcedure.name} ({selectedProcedure.code})
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <Label htmlFor="serviceType">Tipo de Servicio</Label>
                                        <Select value={serviceType} onValueChange={setServiceType}>
                                            <SelectTrigger id="serviceType">
                                                <SelectValue placeholder="Seleccione tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CONSULTA">Consulta</SelectItem>
                                                <SelectItem value="EXAMEN">Examen</SelectItem>
                                                <SelectItem value="TRATAMIENTO">Tratamiento</SelectItem>
                                                <SelectItem value="CIRUGIA">Cirugía</SelectItem>
                                                <SelectItem value="HOSPITALIZACION">Hospitalización</SelectItem>
                                                <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
                                                <SelectItem value="OTROS">Otros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="customAmount">Monto</Label>
                                        <Input
                                            id="customAmount"
                                            type="number"
                                            step="0.01"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <Button onClick={addService} className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected Services List */}
                {selectedServices.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-medium">Procedimientos Asignados al Caso</Label>
                            <Badge variant="outline" className="text-sm">
                                Total: ${getTotalAmount().toFixed(2)}
                            </Badge>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedServices.map((service, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{service.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {service.type} - ${service.amount.toFixed(2)}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeService(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message when no procedures are available or baremoId is missing */}
                {procedures.length === 0 && !isLoading && baremoId && (
                    <div className="text-center py-8 text-gray-500">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No hay procedimientos activos disponibles en este baremo.</p>
                    </div>
                )}

                {!baremoId && (
                    <div className="text-center py-8 text-gray-500">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>Seleccione un cliente con un baremo asignado para ver los procedimientos.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}