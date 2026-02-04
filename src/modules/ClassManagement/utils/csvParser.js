/**
 * Simple robust CSV Parser
 * Handles:
 * - UTF-8 BOM
 * - Auto-detect delimiter (comma or semicolon)
 * - Quoted fields with newlines/delimiters
 */

export const parseCSV = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const text = e.target.result
            try {
                const results = processCSV(text)
                resolve(results)
            } catch (err) {
                reject(err)
            }
        }

        reader.onerror = () => reject(new Error('Dosya okunamadı.'))
        reader.readAsText(file, 'UTF-8') // Default UTF-8
    })
}

const processCSV = (str) => {
    // Remove BOM if present
    const content = str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str

    // Detect Delimiter (look at first line)
    const firstLine = content.split('\n')[0]
    const commaCount = (firstLine.match(/,/g) || []).length
    const semiCount = (firstLine.match(/;/g) || []).length
    const delimiter = semiCount > commaCount ? ';' : ','

    // Parse
    const rows = []
    let currentRow = []
    let currentVal = ''
    let inQuotes = false

    for (let i = 0; i < content.length; i++) {
        const char = content[i]
        const nextChar = content[i + 1]

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                currentVal += '"'
                i++ // skip escaped quote
            } else if (char === '"') {
                inQuotes = false
            } else {
                currentVal += char
            }
        } else {
            if (char === '"') {
                inQuotes = true
            } else if (char === delimiter) {
                currentRow.push(currentVal.trim())
                currentVal = ''
            } else if (char === '\r' || char === '\n') {
                if (currentVal || currentRow.length > 0) {
                    currentRow.push(currentVal.trim())
                    rows.push(currentRow)
                }
                currentRow = []
                currentVal = ''
                // Handle \r\n
                if (char === '\r' && nextChar === '\n') i++
            } else {
                currentVal += char
            }
        }
    }

    // Last row
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim())
        rows.push(currentRow)
    }

    return {
        data: rows,
        delimiter: delimiter
    }
}

export const generateTemplateCSV = () => {
    const headers = ['Okul No', 'Ad Soyad', 'Cinsiyet', 'Etiketler', 'Notlar']
    const rows = [
        headers.join(';'),
        '101;Ahmet Yılmaz;E;Gözlük,Dikkat;Ön sırada oturtun',
        '102;Ayşe Demir;K;;'
    ]
    return rows.join('\n')
}
