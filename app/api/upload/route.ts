import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const files = formData.getAll("files") as File[] // 'files' es el nombre del campo en el FormData

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded." }, { status: 400 })
        }

        const uploadedDocuments: { name: string; url: string }[] = []

        for (const file of files) {
            // --- LÓGICA PARA GUARDAR EL ARCHIVO EN TU VPS ---
            // Aquí es donde integrarías la lógica para guardar 'file' en tu VPS.
            // Esto podría implicar:
            // 1. Leer el 'file.arrayBuffer()' o 'file.stream()'.
            // 2. Escribir el archivo en un directorio en tu VPS.
            // 3. O subirlo a un servicio de almacenamiento en la nube (AWS S3, Google Cloud Storage, Vercel Blob, etc.)
            //    si tu VPS tiene acceso a internet y las credenciales necesarias.

            // Por ahora, simularemos la subida y generaremos una URL de placeholder.
            // En un entorno real, 'fileUrl' sería la URL pública del archivo guardado en tu VPS.
            const fileExtension = file.name.split(".").pop() || "bin"
            const uniqueFileName = `${uuidv4()}.${fileExtension}`
            const fileUrl = `/uploads/${uniqueFileName}` // Esta sería la URL real en tu VPS

            console.log(`Simulating upload of file: ${file.name} (${file.type}, ${file.size} bytes)`)
            console.log(`Would be saved to: ${fileUrl}`)

            uploadedDocuments.push({
                name: file.name,
                url: fileUrl,
            })
        }

        return NextResponse.json({ success: true, documents: uploadedDocuments }, { status: 200 })
    } catch (error) {
        console.error("Error uploading files:", error)
        return NextResponse.json({ error: "Failed to upload files." }, { status: 500 })
    }
}
