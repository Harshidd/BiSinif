
// Docs-specific constants and utilities
// ISOLATED: Does not import from ClassManagement

export const GRADES = [
    { value: '5', label: '5. Sınıf' },
    { value: '6', label: '6. Sınıf' },
    { value: '7', label: '7. Sınıf' },
    { value: '8', label: '8. Sınıf' }
]

export const BRANCHES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Helper: Normalize class name (e.g. "6-A " -> "6A")
export const normalizeClassName = (raw) => {
    if (!raw) return ''

    // Remove all whitespace
    let clean = raw.replace(/\s+/g, '').toUpperCase()

    // Remove dashes/slashes often typed by users (e.g. 6-A -> 6A)
    clean = clean.replace(/[-/]/g, '')

    // Basic validation: Must start with number, contain letter
    // If it doesn't match standard format, return as is (trust user), 
    // but trimmed and upper.
    return clean
}

// Helper: Generate common class list for picker
export const getCommonClasses = () => {
    const list = []
    GRADES.forEach(g => {
        // Common branches A-F
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(b => {
            list.push(`${g.value}${b}`)
        })
    })
    return list
}
