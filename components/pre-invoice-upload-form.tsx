"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { X, FileText, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Document {
    name: string
    url: string
    type?: string
    size?: number
}

interface PreInvoiceUploadFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: (caseId: string, documents: Document[]) => void
    caseId: string
    initialDocuments?: Document[]
}

export function PreInvoiceUploadForm({
    isOpen,
    onClose,
    onSave,
    caseId,
    initialDocuments = [],
}: PreInvoiceUploadFormProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [existingDocuments, setExistingDocuments] = useState<Document[]>(initialDocuments)
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setExistingDocuments(initialDocuments)
    }, [initialDocuments])

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files)

            // Validate file size (10MB max)
            const oversizedFiles = newFiles.filter((file) => file.size > 10 * 1024 * 1024)
            if (oversizedFiles.length > 0) {
                toast({
                    title: "Archivos demasiado grandes",
                    description: `Los siguientes archivos exceden el límite de 10MB: ${oversizedFiles.map((f) => f.name).join(", ")}`,
                    variant: "destructive",
                })
                return
            }

            setSelectedFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleRemoveSelectedFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleRemoveExistingDocument = (indexToRemove: number) => {
        setExistingDocuments((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedFiles.length === 0 && existingDocuments.length === 0) {
            toast({
                title: "Información",
                description: "No se han añadido ni seleccionado documentos para guardar.",
                variant: "default",
            })
            onClose()
            return
        }

        setIsUploading(true)
        let uploadedUrls: Document[] = []

        if (selectedFiles.length > 0) {
            const formData = new FormData()
            selectedFiles.forEach((file) => {
                formData.append("files", file)
            })
            formData.append("uploadType", "pre-invoice")
            formData.append("caseId", caseId)

            try {
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Error al subir prefactura.")
                }

                const data = await response.json()
                uploadedUrls = data.documents

                toast({
                    title: "Éxito",
                    description: data.message || "Prefactura subida correctamente.",
                    variant: "default",
                })
            } catch (error: any) {
                toast({
                    title: "Error al subir prefactura",
                    description: error.message || "Ocurrió un error inesperado.",
                    variant: "destructive",
                })
                setIsUploading(false)
                return
            }
        }

        // Combine existing documents with newly uploaded ones
        const allDocuments = [...existingDocuments, ...uploadedUrls]
        onSave(caseId, allDocuments)
        setSelectedFiles([])
        setIsUploading(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Subir Prefactura</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Tipos de archivo permitidos: PDF, JPG, PNG, XLS, XLSX
                            <br />
                            Tamaño máximo por archivo: 10MB
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="fileUpload">Seleccionar Archivos de Prefactura</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                id="fileUpload"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                            />
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                                disabled={isUploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Elegir Archivos
                            </Button>
                        </div>
                    </div>

                    {(selectedFiles.length > 0 || existingDocuments.length > 0) && (
                        <div className="space-y-2">
                            <Label>Archivos Seleccionados / Prefacturas Existentes</Label>
                            <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                                {existingDocuments.map((doc, index) => (
                                    <div
                                        key={`existing-${index}`}
                                        className="flex items-center justify-between py-2 px-2 hover:bg-muted rounded-sm border-b last:border-b-0"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline text-blue-600 hover:text-blue-800 block truncate"
                                                    title={doc.name}
                                                >
                                                    {doc.name}
                                                </a>
                                                <span className="text-xs text-muted-foreground">(Existente)</span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveExistingDocument(index)}
                                            className="h-auto p-1 flex-shrink-0"
                                            disabled={isUploading}
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                            <span className="sr-only">Eliminar {doc.name}</span>
                                        </Button>
                                    </div>
                                ))}
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="flex items-center justify-between py-2 px-2 hover:bg-muted rounded-sm border-b last:border-b-0"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="block truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">(Nuevo - {formatFileSize(file.size)})</span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveSelectedFile(index)}
                                            className="h-auto p-1 flex-shrink-0"
                                            disabled={isUploading}
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                            <span className="sr-only">Eliminar {file.name}</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isUploading}>
                            {isUploading ? "Subiendo..." : "Guardar Prefactura"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
