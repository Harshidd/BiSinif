import { classRepo } from '../../repo/classRepo'
import { seatingRepo } from '../repo/seatingRepo'

/**
 * Baseline Seating Algorithm v3
 * Supports partial generation, pinned seats, gender balance mode, and special needs priority.
 */
/**
 * Baseline Seating Algorithm v3 - Refactored for Deterministic & Front-to-Back Logic
 * Supports front-to-back fill, double desk pairing, and deterministic behavior.
 */
/**
 * Pseudo-random number generator (Linear Congruential Generator)
 * Seeded for deterministic behavior week-over-week.
 */
const LCG = (seed) => {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    }
}

/**
 * Generate a seed based on current ISO Week (Rotation)
 */
const getRotationSeed = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now - start
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    const weekNum = Math.floor(diff / oneWeek)
    return (now.getFullYear() * 100) + weekNum
}

export const generateSeatingPlan = (existingPlan = null, mode = 'free') => {
    // 1. Gather Data & Seed
    const seed = getRotationSeed()
    const random = LCG(seed)
    console.log(`[SeatingAlgo] Starting generation... Mode: ${mode}, Seed: ${seed}`)

    const roster = classRepo.getStudents()
    const conflicts = classRepo.listConflicts()
    const setup = seatingRepo.loadSetup()
    const rules = seatingRepo.loadRules()

    if (roster.length === 0) return { error: 'Öğrenci listesi (Roster) boş.' }

    // 2. Prepare Grid (Seats) & Desks
    const seats = []
    const desks = []
    // Desk structure: { id: 'D-R1-C1', row, col, isFront, seats: [s1, s2] }

    const capacity = setup.rows * setup.cols * (setup.deskType === 'double' ? 2 : 1)

    for (let r = 1; r <= setup.rows; r++) {
        for (let c = 1; c <= setup.cols; c++) {
            const isFront = r <= setup.frontRows
            const deskId = `D-R${r}-C${c}`
            const deskSeats = []

            if (setup.deskType === 'double') {
                const s1 = { id: `R${r}-C${c}-L`, row: r, col: c, position: 'left', isFront, deskId }
                const s2 = { id: `R${r}-C${c}-R`, row: r, col: c, position: 'right', isFront, deskId }
                seats.push(s1, s2)
                deskSeats.push(s1, s2)
            } else {
                const s1 = { id: `R${r}-C${c}`, row: r, col: c, position: 'single', isFront, deskId }
                seats.push(s1)
                deskSeats.push(s1)
            }

            desks.push({
                id: deskId,
                row: r,
                col: c,
                isFront,
                seats: deskSeats
            })
        }
    }

    if (roster.length > capacity) {
        return { error: `Kapasite yetersiz. ${roster.length} öğrenci var ama sadece ${capacity} koltuk var.` }
    }

    // 3. Handle Pinned Seats
    const assignments = {}
    const pinnedSeatIds = existingPlan?.pinnedSeatIds ? new Set(existingPlan.pinnedSeatIds) : new Set()
    const placedStudentIds = new Set()

    if (existingPlan?.assignments) {
        pinnedSeatIds.forEach(seatId => {
            if (seats.some(s => s.id === seatId)) {
                const studentId = existingPlan.assignments[seatId]
                if (studentId && roster.some(s => s.id === studentId)) {
                    assignments[seatId] = studentId
                    placedStudentIds.add(studentId)
                } else if (studentId) {
                    pinnedSeatIds.delete(seatId) // Student deleted
                }
            } else {
                pinnedSeatIds.delete(seatId) // Seat deleted (layout change)
            }
        })
    }

    // 4. Prepare Student Pool (Deterministic Rotation)
    // Priority Groups:
    // A. Special Needs (Always Top)
    // B. Pinned/Placed (Ignore)
    // C. Remaining (Sort by ID for stability, then Shuffle deterministically)

    let pool = roster.filter(s => !placedStudentIds.has(s.id))

    // Split into priority groups
    const groupSpecial = pool.filter(s => s._profile?.specialNeeds)
    let groupNormal = pool.filter(s => !s._profile?.specialNeeds)

    // Sort normal group by name first for stability
    groupNormal.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    // Shuffle normal group deterministically using seed
    // Fisher-Yates shuffle with seeded random
    for (let i = groupNormal.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [groupNormal[i], groupNormal[j]] = [groupNormal[j], groupNormal[i]];
    }

    // Re-assemble pool: Special Needs first, then Shuffled Normal
    pool = [...groupSpecial, ...groupNormal]

    // --- HELPER: Compatibility Check (Hard vs Soft) ---
    const checkCompat = (s1, s2) => {
        if (!s1 || !s2) return { ok: true, hard: false }

        // Hard Conflict
        const conflict = conflicts.some(c =>
            (c.studentIdA === s1.id && c.studentIdB === s2.id) ||
            (c.studentIdA === s2.id && c.studentIdB === s1.id)
        )
        if (conflict) return { ok: false, hard: true }

        // Soft Gender Constraint
        if (mode === 'girl_boy') {
            if (s1.gender && s2.gender && s1.gender === s2.gender) {
                return { ok: false, hard: false } // Soft fail
            }
        }
        return { ok: true, hard: false }
    }

    // 5. Fill Logic (Front-to-Back)

    for (const desk of desks) {
        const [leftSeat, rightSeat] = desk.seats

        // --- Single Desk ---
        if (!rightSeat) {
            if (assignments[leftSeat.id]) continue;
            if (pool.length === 0) continue;
            const student = pool.shift()
            assignments[leftSeat.id] = student.id
            placedStudentIds.add(student.id)
            continue
        }

        // --- Double Desk ---
        const leftId = leftSeat.id
        const rightId = rightSeat.id
        const leftPinned = !!assignments[leftId]
        const rightPinned = !!assignments[rightId]

        if (leftPinned && rightPinned) continue

        // 5a. One Pinned
        if (leftPinned || rightPinned) {
            const freeSeatId = leftPinned ? rightId : leftId
            const pinnedStudentId = leftPinned ? assignments[leftId] : assignments[rightId]
            const pinnedStudent = roster.find(s => s.id === pinnedStudentId)

            if (pool.length > 0) {
                // Try hard valid match first
                let bestIdx = -1

                // Pass 1: Hard + Soft Valid
                for (let i = 0; i < pool.length; i++) {
                    const res = checkCompat(pinnedStudent, pool[i])
                    if (res.ok) { bestIdx = i; break; }
                }

                // Pass 2: Hard Valid only (Ignore Gender)
                if (bestIdx === -1) {
                    for (let i = 0; i < pool.length; i++) {
                        const res = checkCompat(pinnedStudent, pool[i])
                        if (!res.hard) { bestIdx = i; break; }
                    }
                }

                if (bestIdx !== -1) {
                    const student = pool[bestIdx]
                    pool.splice(bestIdx, 1)
                    assignments[freeSeatId] = student.id
                    placedStudentIds.add(student.id)
                }
                // If still no valid partner (Hard conflict only left), leave empty!
                // We prefer gap over conflict.
            }
            continue
        }

        // 5b. Both Empty -> Pair Up
        if (pool.length === 0) continue

        if (pool.length === 1) {
            // Only 1 student left.
            // PUSH TO BACK STRATEGY:
            // If we are not at the last desk, try to swap with a filled double desk from the end?
            // For simplicity in this iteration: If alone, sit alone.
            const s1 = pool.shift()
            assignments[leftId] = s1.id
            placedStudentIds.add(s1.id)
            continue
        }

        // Try to form a pair
        const s1 = pool.shift()
        let s2Idx = -1

        // Pass 1: Strict (No Conflict + Gender OK)
        for (let i = 0; i < pool.length; i++) {
            const res = checkCompat(s1, pool[i])
            if (res.ok) { s2Idx = i; break; }
        }

        // Pass 2: Relaxed (No Conflict Only)
        if (s2Idx === -1) {
            for (let i = 0; i < pool.length; i++) {
                const res = checkCompat(s1, pool[i])
                if (!res.hard) { s2Idx = i; break; }
            }
        }

        if (s2Idx !== -1) {
            const s2 = pool[s2Idx]
            pool.splice(s2Idx, 1)
            assignments[leftId] = s1.id
            assignments[rightId] = s2.id
            placedStudentIds.add(s1.id)
            placedStudentIds.add(s2.id)
        } else {
            // S1 has conflict with EVERYONE remaining?
            // This is rare. Sit alone.
            assignments[leftId] = s1.id
            placedStudentIds.add(s1.id)
        }
    }

    // 6. Validation & Reporting
    const violations = validatePlan(assignments, seats, roster, conflicts, rules)

    const stats = {
        totalStudents: roster.length,
        placed: placedStudentIds.size,
        unplaced: roster.length - placedStudentIds.size,
        conflictsViolated: violations.filter(v => v.type === 'conflict').length,
        specialNeedsViolation: violations.filter(v => v.type === 'specialNeeds').length
    }

    return {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        assignments,
        pinnedSeatIds: Array.from(pinnedSeatIds),
        manualMoves: existingPlan?.manualMoves || 0,
        seats,
        stats,
        violations
    }
}


/**
 * Validates a plan and returns violation objects
 */
export const validatePlan = (assignments, seats, roster, conflicts, rules) => {
    const violations = []

    Object.entries(assignments).forEach(([seatId, studentId]) => {
        if (!studentId) return
        const student = roster.find(s => s.id === studentId)
        if (!student) return
        const seat = seats.find(s => s.id === seatId)
        if (!seat) return

        // 1. Special Needs Front Check
        // Explicitly check boolean flag now
        if (student._profile?.specialNeeds && !seat.isFront) {
            violations.push({
                type: 'specialNeeds',
                seatId,
                studentId,
                message: `${student.name} (Özel Durum) ön sırada olmalı.`
            })
        }

        // 2. Conflict Check (Neighbor)
        if (seat.id.includes('-L') || seat.id.includes('-R')) {
            const suffix = seat.id.endsWith('-L') ? '-R' : '-L'
            const base = seat.id.substring(0, seat.id.length - 2)
            const neighborId = assignments[base + suffix]

            if (neighborId) {
                if (seatId.includes('-L')) {
                    const hasConflict = conflicts.some(c =>
                        (c.studentIdA === studentId && c.studentIdB === neighborId) ||
                        (c.studentIdA === neighborId && c.studentIdB === studentId)
                    )
                    if (hasConflict) {
                        violations.push({
                            type: 'conflict',
                            seatId,
                            neighborSeatId: base + suffix,
                            message: `${student.name} ve yanındaki öğrenci arasında çatışma kuralı var.`
                        })
                    }
                }
            }
        }
    })

    return violations
}
