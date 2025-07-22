"use client"

import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PreInvoiceDialogProps {
    isOpen: boolean
    onClose: () => void
    caseId: string
}

export function PreInvoiceDialog({ isOpen, onClose, caseId }: PreInvoiceDialogProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const handleGeneratePreInvoice = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/pre-invoice/${caseId}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to generate pre-invoice")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `prefactura_caso_${caseId}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)

            toast({
                title: "Éxito",
                description: "Prefactura generada y descargada correctamente.",
            })
            onClose()
        } catch (error: any) {
            console.error("Error generating pre-invoice:", error)
            toast({
                title: "Error",
                description: error.message || "No se pudo generar la prefactura.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Generar Prefactura</DialogTitle>
                <DialogDescription>Confirma para generar y descargar la prefactura de este caso.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <p className="text-sm text-gray-500">
                    Se generará un documento PDF con el detalle de los servicios y costos asociados a este caso.
                </p>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button onClick={handleGeneratePreInvoice} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Generando..." : "Generar y Descargar"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}
