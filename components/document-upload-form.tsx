"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { X, FileText, Upload } from "lucide-react"

interface Document {
    name: string
    url: string // URL del documento subido
}

interface DocumentUploadFormProps {
    isOpen: boolean
    onClose: () => void
    onSave: (caseId: string, documents: Document[]) => void
    caseId: string
    initialDocuments?: Document[]
    initialDocumentName?: string // Nuevo prop para pre-llenar el nombre
}

export function DocumentUploadForm({
    isOpen,
    onClose,
    onSave,
    caseId,
    initialDocuments = [],
    initialDocumentName = "", // Valor por defecto
}: DocumentUploadFormProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [existingDocuments, setExistingDocuments] = useState<Document[]>(initialDocuments)
    const [newDocumentName, setNewDocumentName] = useState(initialDocumentName) // Usar el prop inicial
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setExistingDocuments(initialDocuments)
    }, [initialDocuments])

    useEffect(() => {
        setNewDocumentName(initialDocumentName) // Actualizar si el prop cambia
    }, [initialDocumentName])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files)])
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

        let uploadedUrls: Document[] = []

        if (selectedFiles.length > 0) {
            const formData = new FormData()
            selectedFiles.forEach((file) => {
                formData.append("files", file)
            })

            try {
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Failed to upload files.")
                }

                const data = await response.json()
                uploadedUrls = data.documents // Asume que el backend devuelve un array de { name, url }
                toast({
                    title: "Éxito",
                    description: "Documentos subidos correctamente.",
                    variant: "success",
                })
            } catch (error: any) {
                toast({
                    title: "Error al subir documentos",
                    description: error.message || "Ocurrió un error inesperado.",
                    variant: "destructive",
                })
                return // Detener el proceso si la subida falla
            }
        }

        // Combinar documentos existentes con los recién subidos
        const allDocuments = [...existingDocuments, ...uploadedUrls]
        onSave(caseId, allDocuments)
        setSelectedFiles([]) // Limpiar archivos seleccionados después de guardar
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Subir Documentos al Caso</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="documentName">Nombre del Documento</Label>
                        <div className="flex gap-2">
                            <Input
                                id="documentName"
                                value={newDocumentName}
                                onChange={(e) => setNewDocumentName(e.target.value)}
                                placeholder="Ej: Informe Médico, Resultados Laboratorio"
                            />
                            <Button type="button" onClick={() => fileInputRef.current?.click()} size="icon">
                                <Upload className="h-4 w-4" />
                                <span className="sr-only">Elegir Archivo</span>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fileUpload">Seleccionar Archivos</Label>
                        <Input
                            id="fileUpload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                    </div>

                    {(selectedFiles.length > 0 || existingDocuments.length > 0) && (
                        <div className="space-y-2">
                            <Label>Archivos Seleccionados / Documentos Existentes</Label>
                            <ul className="border rounded-md p-2 max-h-40 overflow-y-auto">
                                {existingDocuments.map((doc, index) => (
                                    <li
                                        key={`existing-${index}`}
                                        className="flex items-center justify-between py-1 px-2 hover:bg-muted rounded-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline text-blue-600 hover:text-blue-800"
                                            >
                                                {doc.name} (Existente)
                                            </a>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveExistingDocument(index)}
                                            className="h-auto p-1"
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                            <span className="sr-only">Eliminar {doc.name}</span>
                                        </Button>
                                    </li>
                                ))}
                                {selectedFiles.map((file, index) => (
                                    <li
                                        key={`new-${index}`}
                                        className="flex items-center justify-between py-1 px-2 hover:bg-muted rounded-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-500" />
                                            <span>{file.name} (Nuevo)</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveSelectedFile(index)}
                                            className="h-auto p-1"
                                        >
                                            <X className="h-4 w-4 text-red-500" />
                                            <span className="sr-only">Eliminar {file.name}</span>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                            Guardar Documentos
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
