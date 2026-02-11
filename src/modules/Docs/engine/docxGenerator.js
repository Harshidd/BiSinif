
/**
 * DOCS ENGINE V1: DOCX Generator
 * 
 * Handles lazy loading of template engine and generation of .docx files
 * from base64 templates defined in the registry.
 */

export const generateDocx = async (template, metadata) => {
    try {
        if (!template || !template.sourceBase64) {
            throw new Error('Geçersiz şablon veya kaynak bulunamadı.')
        }

        // 1. Lazy load heavy libraries
        // This ensures they are not in the main bundle
        const [PizZipModule, DocxtemplaterModule] = await Promise.all([
            import('pizzip'),
            import('docxtemplater')
        ])

        const PizZip = PizZipModule.default
        const Docxtemplater = DocxtemplaterModule.default

        // 2. Load Zip
        // PizZip handles base64 directly with option
        const zip = new PizZip(template.sourceBase64, { base64: true })

        // 3. Init Docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            // Null getter to prevent crashes on undefined values
            nullGetter: (part) => {
                // If a value is missing (e.g. {missingVar}), return empty string instead of undefined/null
                if (!part.module) {
                    return ""
                }
                if (part.module === "std") {
                    return ""
                }
                return ""
            }
        })

        // 4. Prepare Data
        // Deterministic date: YYYY-MM-DD
        const today = new Date()
        const dateIso = today.toISOString().split('T')[0] // 2024-02-14
        const dateFormatted = today.toLocaleDateString('tr-TR') // 14.02.2024 (for visible text)

        // Safety: Ensure no undefined values trickle down
        const safeMetadata = {}
        Object.keys(metadata).forEach(k => {
            safeMetadata[k] = metadata[k] || ""
        })

        const data = {
            ...safeMetadata,
            date: dateFormatted,
            dateIso: dateIso,
            title: template.title,
            category: mapCategoryToName(template.category)
        }

        // 5. Render
        doc.render(data)

        // 6. Generate Blob
        const blob = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE',
        })

        // 7. Generate Deterministic Filename
        const filename = generateFilename(template.filePattern, data)

        // 8. Download
        saveBlob(blob, filename)

        return { success: true }

    } catch (error) {
        console.error('[DocsEngine] Generation failed:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Generate standardized filename
 * Replaces placeholders like {className} with safe values.
 */
const generateFilename = (pattern, data) => {
    if (!pattern) return 'dokuman.docx'

    let filename = pattern

    // Common placeholders
    // Pattern: Some_File_{className}_{date}
    if (filename.includes('{className}')) {
        const safeClass = normalizeFilename(data.className || 'Sinif')
        filename = filename.replace('{className}', safeClass)
    }

    if (filename.includes('{schoolName}')) {
        const safeSchool = normalizeFilename(data.schoolName || 'Okul')
        filename = filename.replace('{schoolName}', safeSchool)
    }

    if (filename.includes('{date}')) {
        // Use ISO date for filenames for better sorting: YYYY-MM-DD
        filename = filename.replace('{date}', data.dateIso)
    }

    // Default cleanup if no placeholders but patterns exist? 
    // Just simple safety replace.

    return `${filename}.docx`
}

// Convert string to safe filename
const normalizeFilename = (str) => {
    if (!str) return ''
    return str
        .trim()
        .replace(/\s+/g, '_') // Space -> _
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/[^a-zA-Z0-9_\-]/g, '') // Remove non-alphanumeric except _ -
}

// Helper: Map category code to display name
const mapCategoryToName = (cat) => {
    switch (cat) {
        case 'discipline': return 'Disiplin'
        case 'committee': return 'Zümre'
        case 'plans': return 'Planlama'
        case 'homework': return 'Ödev Takip'
        default: return 'Genel'
    }
}

// Helper: Download Blob
const saveBlob = (blob, filename) => {
    if (typeof window === 'undefined') return

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
}
