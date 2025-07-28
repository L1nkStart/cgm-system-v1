import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { getFullUserSession } from "@/lib/auth"

// Define upload paths
const UPLOAD_PATHS = {
    "medical-results": "/home/salu-cgm/docs/resultados-medicos",
    "pre-invoice": "/home/salu-cgm/docs/pre-facturas",
}

// Allowed file types
const ALLOWED_FILE_TYPES = {
    "medical-results": [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    "pre-invoice": [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
}

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await getFullUserSession()
        if (!session) {
            return NextResponse.json({ error: "No autorizado." }, { status: 401 })
        }

        const formData = await req.formData()
        const files = formData.getAll("files") as File[]
        const uploadType = formData.get("uploadType") as string // "medical-results" or "pre-invoice"
        const caseId = formData.get("caseId") as string

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No se han subido archivos." }, { status: 400 })
        }

        if (!uploadType || !UPLOAD_PATHS[uploadType as keyof typeof UPLOAD_PATHS]) {
            return NextResponse.json({ error: "Tipo de subida inválido." }, { status: 400 })
        }

        if (!caseId) {
            return NextResponse.json({ error: "ID de caso requerido." }, { status: 400 })
        }

        // Validate user permissions
        const isSuperusuario = session.role === "Superusuario"
        const isCoordinadorRegional = session.role === "Coordinador Regional"
        const isAnalystConcertado = session.role === "Analista Concertado"

        if (uploadType === "pre-invoice" && !isSuperusuario && !isCoordinadorRegional) {
            return NextResponse.json({ error: "No tienes permisos para subir prefacturas." }, { status: 403 })
        }

        if (uploadType === "medical-results" && !isSuperusuario && !isAnalystConcertado) {
            return NextResponse.json({ error: "No tienes permisos para subir resultados médicos." }, { status: 403 })
        }

        const uploadPath = UPLOAD_PATHS[uploadType as keyof typeof UPLOAD_PATHS]
        const allowedTypes = ALLOWED_FILE_TYPES[uploadType as keyof typeof ALLOWED_FILE_TYPES]

        // Create case-specific directory
        const caseUploadPath = path.join(uploadPath, caseId)

        // Ensure directory exists
        if (!existsSync(caseUploadPath)) {
            await mkdir(caseUploadPath, { recursive: true })
        }

        const uploadedDocuments: { name: string; url: string; type: string; size: number }[] = []

        for (const file of files) {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    {
                        error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: ${allowedTypes.join(", ")}`,
                    },
                    { status: 400 },
                )
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        error: `El archivo ${file.name} excede el tamaño máximo de 10MB.`,
                    },
                    { status: 400 },
                )
            }

            // Generate unique filename
            const fileExtension = path.extname(file.name)
            const baseName = path.basename(file.name, fileExtension)
            const uniqueFileName = `${baseName}_${uuidv4()}${fileExtension}`
            const filePath = path.join(caseUploadPath, uniqueFileName)

            try {
                // Convert file to buffer and save
                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)

                await writeFile(filePath, buffer)

                // Generate public URL (adjust based on your web server configuration)
                const publicUrl = `/docs/${uploadType === "medical-results" ? "resultados-medicos" : "pre-facturas"}/${caseId}/${uniqueFileName}`

                uploadedDocuments.push({
                    name: file.name,
                    url: publicUrl,
                    type: file.type,
                    size: file.size,
                })

                console.log(`File uploaded successfully: ${file.name} -> ${filePath}`)
            } catch (fileError) {
                console.error(`Error saving file ${file.name}:`, fileError)
                return NextResponse.json(
                    {
                        error: `Error al guardar el archivo ${file.name}.`,
                    },
                    { status: 500 },
                )
            }
        }

        return NextResponse.json(
            {
                success: true,
                documents: uploadedDocuments,
                message: `${uploadedDocuments.length} archivo(s) subido(s) exitosamente.`,
            },
            { status: 200 },
        )
    } catch (error) {
        console.error("Error uploading files:", error)
        return NextResponse.json({ error: "Error interno del servidor al subir archivos." }, { status: 500 })
    }
}
