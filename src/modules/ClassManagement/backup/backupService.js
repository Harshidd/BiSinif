import { CLASS_MANAGEMENT_KEYS, KEY_GROUPS } from './backupKeys'
import { migrateAndValidate } from './migrateAfterRestore'
import { v4 as uuidv4 } from 'uuid'

const BACKUP_VERSION = 'class_backup_v1'
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

// Helper: LocalStorage Wrapper
const ls = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch (e) { return null }
    },
    set: (key, val) => {
        if (val === null || val === undefined) localStorage.removeItem(key)
        else localStorage.setItem(key, JSON.stringify(val))
    }
}

// Helper: Normalize text
const normalizeForMatch = (text) => {
    if (!text) return ''
    return String(text).trim().toLowerCase()
        .replace(/\s+/g, ' ').replace(/ı/g, 'i')
        .replace(/ş/g, 's').replace(/ğ/g, 'g')
        .replace(/ü/g, 'u').replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
}

// Helper: Generate History Signature v1.0.2
// Captures the essence of a plan: Geometry + Placements + Pins + Config
const getHistorySignature = (item) => {
    if (!item) return ''
    const parts = [
        item.rows || item.setup?.rows || 0,
        item.cols || item.setup?.cols || 0,
        item.setup?.deskType || 'double',
        JSON.stringify(item.layout || {}),
        JSON.stringify(item.pinnedSeatIds || []),
        item.manualMoves || 0,
        JSON.stringify(item.rules || {}),
        JSON.stringify(item.setup || {})
    ]
    return parts.join('|')
}

export const backupService = {

    // --- EXPORT ---
    createBackup: () => {
        const data = {}
        // Only export allowed keys
        CLASS_MANAGEMENT_KEYS.forEach(key => {
            const val = ls.get(key)
            if (val !== null) data[key] = val
        })

        return {
            version: BACKUP_VERSION,
            createdAt: new Date().toISOString(),
            appVersion: '1.0.2',
            data
        }
    },

    downloadBackup: (backupObj) => {
        const jsonStr = JSON.stringify(backupObj, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')

        const a = document.createElement('a')
        a.href = url
        a.download = `bisinif_class_backup_${dateStr}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    },

    // --- IMPORT VALIDATION ---
    validateOrParse: (input) => {
        if (typeof input === 'string' && input.length > MAX_FILE_SIZE_BYTES) {
            return { valid: false, error: 'Dosya boyutu çok büyük (Max 2MB).' }
        }

        try {
            const parsed = typeof input === 'string' ? JSON.parse(input) : input

            if (!parsed.version || !parsed.data) {
                return { valid: false, error: 'Geçersiz yedek dosyası formatı.' }
            }

            // Stats for Preview
            const roster = parsed.data['bisinif_class_roster_v1'] || []
            const history = parsed.data['bisinif_class_seating_history_v1'] || []
            const hasPlan = !!parsed.data['bisinif_class_seating_plan_v2']

            // --- Dry Run for Conflicts ---
            const currentRoster = ls.get('bisinif_class_roster_v1') || []
            const currentRosterIds = new Set(currentRoster.map(s => s.studentId || s.rosterId))
            let updateStudents = 0
            let newStudents = 0

            roster.forEach(s => {
                let isUpdate = false
                const id = s.studentId || s.rosterId
                if (id && currentRosterIds.has(id)) {
                    isUpdate = true
                } else {
                    const targetNo = normalizeForMatch(s.schoolNo)
                    const targetName = normalizeForMatch(s.fullName)
                    const exists = currentRoster.some(curr => {
                        return (targetNo && normalizeForMatch(curr.schoolNo) === targetNo) ||
                            (targetName === normalizeForMatch(curr.fullName))
                    })
                    if (exists) isUpdate = true
                }

                if (isUpdate) updateStudents++
                else newStudents++
            })

            return {
                valid: true,
                data: parsed,
                stats: {
                    studentCount: roster.length,
                    historyCount: history.length,
                    hasActivePlan: hasPlan,
                    newStudentsApprox: newStudents,
                    updateStudentsApprox: updateStudents,
                    createdAt: parsed.createdAt
                }
            }
        } catch (e) {
            return { valid: false, error: 'JSON okuma hatası: ' + e.message }
        }
    },

    // --- RESTORE ---
    restore: (backupContent, mode = 'merge', options = { includeActivePlan: false }) => {
        try {
            const { valid, data: backup, error } = backupService.validateOrParse(backupContent)
            if (!valid) throw new Error(error)

            const incoming = backup.data
            let finalState = {}

            // 1. Prepare Base State
            if (mode === 'overwrite') {
                CLASS_MANAGEMENT_KEYS.forEach(k => {
                    finalState[k] = incoming[k]
                })
            } else {
                // MERGE
                CLASS_MANAGEMENT_KEYS.forEach(k => {
                    const local = ls.get(k)
                    // If local exists, keep it. If not, use incoming (e.g. restoring to empty state)
                    finalState[k] = local !== null ? local : incoming[k]
                })

                // A. MERGE ROSTER
                const currentRoster = finalState['bisinif_class_roster_v1'] || []
                const incomingRoster = incoming['bisinif_class_roster_v1'] || []
                const currentProfiles = finalState['bisinif_class_profiles_v1'] || {}
                const incomingProfiles = incoming['bisinif_class_profiles_v1'] || {}

                incomingRoster.forEach(newItem => {
                    const normNo = normalizeForMatch(newItem.schoolNo)
                    const normName = normalizeForMatch(newItem.fullName)

                    // Match Logic: Check studentId first (v1.0.2), then rosterId (Legacy), then No/Name
                    const incId = newItem.studentId || newItem.rosterId

                    const idx = currentRoster.findIndex(curr => {
                        const curId = curr.studentId || curr.rosterId
                        if (incId && curId && curId === incId) return true

                        // Fallback: No / Name
                        if (normNo && normalizeForMatch(curr.schoolNo) === normNo) return true
                        if (normName === normalizeForMatch(curr.fullName)) return true
                        return false
                    })

                    if (idx > -1) {
                        // UPDATE
                        const exist = currentRoster[idx]
                        // Match Found -> Keep Existing ID (Stability)
                        const stableId = exist.studentId || exist.rosterId || exist.id

                        currentRoster[idx] = {
                            ...exist,
                            ...newItem,
                            // Enforce ID Stability & Standardization
                            studentId: stableId,
                            rosterId: stableId
                        }

                        // Merge Profile
                        if (incId && incomingProfiles[incId]) {
                            currentProfiles[stableId] = {
                                ...(currentProfiles[stableId] || {}),
                                ...incomingProfiles[incId]
                            }
                        }
                    } else {
                        // INSERT
                        let newId = incId
                        // Collision check (Should be rare if UUID)
                        if (!newId || currentRoster.some(s => (s.studentId || s.rosterId) === newId)) {
                            newId = uuidv4()
                        }

                        const toAdd = {
                            ...newItem,
                            studentId: newId,
                            rosterId: newId // Sync
                        }
                        currentRoster.push(toAdd)

                        // Add Profile
                        if (incId && incomingProfiles[incId]) {
                            currentProfiles[newId] = incomingProfiles[incId]
                        }
                    }
                })

                finalState['bisinif_class_roster_v1'] = currentRoster
                finalState['bisinif_class_profiles_v1'] = currentProfiles

                // Merge Conflicts
                const curConflicts = finalState['bisinif_class_conflicts_v1'] || []
                const incConflicts = incoming['bisinif_class_conflicts_v1'] || []
                const conflictSigs = new Set(curConflicts.map(c => [c.studentIdA, c.studentIdB].sort().join('-')))

                incConflicts.forEach(c => {
                    const sig = [c.studentIdA, c.studentIdB].sort().join('-')
                    if (!conflictSigs.has(sig)) {
                        curConflicts.push(c)
                        conflictSigs.add(sig)
                    }
                })
                finalState['bisinif_class_conflicts_v1'] = curConflicts

                // B. MERGE HISTORY (Dedupe)
                const curHistory = finalState['bisinif_class_seating_history_v1'] || []
                const incHistory = incoming['bisinif_class_seating_history_v1'] || []

                const curHistoryMap = new Map()
                curHistory.forEach(h => curHistoryMap.set(getHistorySignature(h), h))
                const existingIds = new Set(curHistory.map(h => h.id))

                incHistory.forEach(h => {
                    const sig = getHistorySignature(h)
                    const existingItem = curHistoryMap.get(sig)

                    if (existingItem) {
                        existingItem.updatedAt = new Date().toISOString()
                    } else {
                        if (existingIds.has(h.id)) h.id = uuidv4()
                        curHistory.push(h)
                        curHistoryMap.set(sig, h)
                    }
                })
                curHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                finalState['bisinif_class_seating_history_v1'] = curHistory

                // C. ACTIVE PLAN
                if (options.includeActivePlan) {
                    KEY_GROUPS.ACTIVE_PLAN.forEach(k => {
                        if (incoming[k] !== undefined) finalState[k] = incoming[k]
                    })
                }
            }

            // 2. MIGRATE & VALIDATE
            const { data: cleanedState, logs } = migrateAndValidate(finalState)

            // 3. COMMIT
            Object.keys(cleanedState).forEach(key => {
                if (CLASS_MANAGEMENT_KEYS.includes(key)) {
                    ls.set(key, cleanedState[key])
                }
            })

            return {
                success: true,
                log: mode === 'merge' ? 'Yedek başarıyla birleştirildi.' : 'Yedek başarıyla yüklendi.',
                details: logs
            }

        } catch (e) {
            console.error('Restore Error:', e)
            return { success: false, error: e.message }
        }
    }
}
