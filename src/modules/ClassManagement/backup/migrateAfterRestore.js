import { v4 as uuidv4 } from 'uuid'

/**
 * Validates and Cleans data after a restore operation.
 * @param {Object} data - The flat map of key->value from the restore process (in-memory)
 * @returns {Object} - The cleaned data ready to be written only if validation passes
 */
export const migrateAndValidate = (data) => {
    const cleaned = { ...data }
    const logs = []

    const log = (msg) => logs.push(msg)

    // Helper: Safe Parse
    const safeParse = (key, val) => {
        if (!val) return null
        // If it's already an object (from backupService internal handling), return it
        if (typeof val === 'object') return val
        try {
            return JSON.parse(val)
        } catch (e) {
            log(`Corrupt JSON dropped for key: ${key}`)
            return null
        }
    }

    // --- 1. ROSTER MIGRATION ---
    const rosterKey = 'bisinif_class_roster_v1'
    let roster = safeParse(rosterKey, cleaned[rosterKey])

    if (Array.isArray(roster)) {
        let fixedCount = 0
        roster = roster.filter(s => s && typeof s === 'object').map(student => {
            // v1.0.2 Standardization: Ensure studentId exists
            // If we have rosterId but no studentId, use it.
            if (!student.studentId) {
                if (student.rosterId) {
                    student.studentId = student.rosterId
                } else {
                    student.studentId = uuidv4()
                }
                fixedCount++
            }
            // Ensure bidirectional sync for legacy
            if (!student.rosterId) student.rosterId = student.studentId

            // Ensure fields
            if (!student.fullName) student.fullName = student.name || 'Bilinmeyen Öğrenci'
            if (!student.schoolNo) student.schoolNo = student.no || ''

            return student
        })

        if (fixedCount > 0) log(`Fixed ${fixedCount} students (Added studentId).`)
        cleaned[rosterKey] = roster
    } else {
        // If roster is invalid/missing, initialize empty
        if (cleaned[rosterKey] !== undefined) {
            cleaned[rosterKey] = []
            log('Invalid roster data reset to empty.')
        }
    }

    // --- 2. SEATING HISTORY MIGRATION ---
    const historyKey = 'bisinif_class_seating_history_v1'
    let history = safeParse(historyKey, cleaned[historyKey])

    if (Array.isArray(history)) {
        // Validation: Must have 'id' and 'layout'
        const initialLen = history.length
        history = history.filter(h => h && h.id && h.layout)

        if (history.length < initialLen) {
            log(`Dropped ${initialLen - history.length} invalid history items.`)
        }
        cleaned[historyKey] = history
    }

    // --- 3. ACTIVE PLAN CHECK ---
    const planKey = 'bisinif_class_seating_plan_v2'
    let plan = safeParse(planKey, cleaned[planKey])
    if (plan && (!plan.assignments || !plan.seatIds)) {
        // Basic schema check failed? Or maybe v2 just needs assignments?
        // Repo says: assignments, pinnedSeatIds.
        if (!plan.assignments) {
            log('Active plan corrupt (missing assignments), dropped.')
            cleaned[planKey] = null
        }
    }

    return {
        data: cleaned,
        logs
    }
}
