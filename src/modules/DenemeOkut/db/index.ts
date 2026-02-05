/**
 * DenemeOkut Module - IndexedDB Database (Dexie)
 * 
 * HARD RULES:
 * - All writes MUST validate with Zod schemas
 * - Indexes for: examId, studentId, timestamp, status
 * - Namespace: bisinif.denemeokut.v1
 */

import Dexie, { type Table } from 'dexie'
import type { DenemeOkutExam, ScanJob, CorrectionEvent, OutboxEvent } from '../types'
import {
    DenemeOkutExamSchema,
    ScanJobSchema,
    CorrectionEventSchema,
    OutboxEventSchema,
    validateOrThrow,
} from '../schemas'

// ============================================
// DATABASE CLASS
// ============================================

export class DenemeOkutDB extends Dexie {
    // Tables
    exams!: Table<DenemeOkutExam, string>
    scans!: Table<ScanJob, string>
    corrections!: Table<CorrectionEvent, string>
    outboxEvents!: Table<OutboxEvent, string>

    constructor() {
        super('bisinif.denemeokut.v1')

        // Define schema
        this.version(1).stores({
            exams: 'id, title, templateId, createdAt, updatedAt',
            scans: 'id, examId, studentId, status, createdAt, processedAt',
            corrections: 'id, scanId, questionId, timestamp, syncedAt',
            outboxEvents: 'id, eventType, idempotencyKey, createdAt, sentAt, retryCount',
        })
    }

    // ============================================
    // VALIDATED WRITE METHODS
    // ============================================

    async addExam(exam: unknown): Promise<string> {
        const validated = validateOrThrow(DenemeOkutExamSchema, exam, 'addExam')
        await this.exams.add(validated)
        return validated.id
    }

    async updateExam(id: string, updates: Partial<DenemeOkutExam>): Promise<void> {
        const existing = await this.exams.get(id)
        if (!existing) {
            throw new Error(`Exam ${id} not found`)
        }

        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
        const validated = validateOrThrow(DenemeOkutExamSchema, updated, 'updateExam')
        await this.exams.put(validated)
    }

    async addScan(scan: unknown): Promise<string> {
        const validated = validateOrThrow(ScanJobSchema, scan, 'addScan')
        await this.scans.add(validated)
        return validated.id
    }

    async updateScan(id: string, updates: Partial<ScanJob>): Promise<void> {
        const existing = await this.scans.get(id)
        if (!existing) {
            throw new Error(`Scan ${id} not found`)
        }

        const updated = { ...existing, ...updates }
        const validated = validateOrThrow(ScanJobSchema, updated, 'updateScan')
        await this.scans.put(validated)
    }

    async addCorrection(correction: unknown): Promise<string> {
        const validated = validateOrThrow(CorrectionEventSchema, correction, 'addCorrection')
        await this.corrections.add(validated)
        return validated.id
    }

    async addOutboxEvent(event: unknown): Promise<string> {
        const validated = validateOrThrow(OutboxEventSchema, event, 'addOutboxEvent')
        await this.outboxEvents.add(validated)
        return validated.id
    }

    // ============================================
    // QUERY HELPERS
    // ============================================

    async getExamsByDate(limit = 50): Promise<DenemeOkutExam[]> {
        return this.exams.orderBy('createdAt').reverse().limit(limit).toArray()
    }

    async getScansByExam(examId: string): Promise<ScanJob[]> {
        return this.scans.where('examId').equals(examId).toArray()
    }

    async getScansNeedingReview(examId?: string): Promise<ScanJob[]> {
        let query = this.scans.where('status').equals('review_needed')
        if (examId) {
            query = query.and((scan) => scan.examId === examId)
        }
        return query.toArray()
    }

    async getPendingOutboxEvents(limit = 100): Promise<OutboxEvent[]> {
        // Dexie does not index undefined values, so we filter
        return this.outboxEvents.filter(e => !e.sentAt).limit(limit).toArray()
    }

    async getCorrectionsByScan(scanId: string): Promise<CorrectionEvent[]> {
        return this.corrections.where('scanId').equals(scanId).sortBy('timestamp')
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const db = new DenemeOkutDB()

// ============================================
// DEV HELPER: Reset DB
// ============================================

export async function resetDenemeOkutDB(): Promise<void> {
    // Environment check
    // @ts-expect-error - Vite env
    if (import.meta.env.DEV) {
        await db.delete()
        await db.open()
        console.log('[DenemeOkut] Database reset complete')
    } else {
        console.warn('[DenemeOkut] Database reset is only available in DEV mode')
    }
}
