/**
 * DenemeOkut Module - TypeScript Type Definitions
 * 
 * HARD RULES:
 * - No 'any' types
 * - All public boundaries validated with Zod
 * - Strict null checks
 */

// ============================================
// EXAM TYPES
// ============================================

export type AnswerChoice = 'A' | 'B' | 'C' | 'D' | 'E'

export interface DenemeOkutExam {
    id: string
    title: string
    templateId: string
    templateVersion: number
    answerKey: Record<number, AnswerChoice> // {1: 'A', 2: 'B', ...}
    questionCount: number
    createdAt: string // ISO 8601
    updatedAt: string // ISO 8601
}

// ============================================
// SCAN TYPES
// ============================================

export type ScanStatus = 'pending' | 'processing' | 'processed' | 'review_needed' | 'completed' | 'failed'

export type ScanFlag = 'LOW_CONFIDENCE' | 'MULTI_MARK' | 'ERASURE' | 'AMBIGUOUS' | 'NO_MARK'

export interface ScanJob {
    id: string
    examId: string
    studentId?: string // Optional (from QR or manual)
    imageUrl: string // Local blob URL or future S3 URL
    templateId: string
    templateVersion: number
    answers: Record<number, AnswerChoice | null> // {1: 'A', 2: null, ...}
    confidence: Record<number, number> // {1: 0.95, 2: 0.45, ...} (0-1 range)
    flags: Record<number, ScanFlag[]> // {2: ['LOW_CONFIDENCE'], 3: ['MULTI_MARK'], ...}
    status: ScanStatus
    createdAt: string // ISO 8601
    processedAt?: string // ISO 8601
}

// ============================================
// CORRECTION TYPES
// ============================================

export interface CorrectionEvent {
    id: string
    scanId: string
    questionId: number
    oldAnswer: AnswerChoice | null
    newAnswer: AnswerChoice | null
    deviceId: string
    timestamp: string // ISO 8601
    syncedAt?: string // ISO 8601
}

// ============================================
// OUTBOX TYPES (Offline Sync)
// ============================================

export type OutboxEventType = 'scan_created' | 'scan_updated' | 'correction_created' | 'exam_created' | 'exam_updated'

export interface OutboxEvent {
    id: string
    eventType: OutboxEventType
    payload: unknown // JSON payload (validated at runtime)
    idempotencyKey: string // {deviceId}-{localEventId}-{timestamp}
    createdAt: string // ISO 8601
    sentAt?: string // ISO 8601
    retryCount: number
}

// ============================================
// TEMPLATE TYPES (Future)
// ============================================

export interface BubbleRegion {
    questionId: number
    choiceId: AnswerChoice
    x: number
    y: number
    w: number
    h: number
}

export interface AutoFormIdRegion {
    type: 'qr' | 'barcode'
    x: number
    y: number
    w: number
    h: number
}

export interface Template {
    templateId: string
    version: number
    name: string
    paperSize: 'A4'
    orientation: 'portrait' | 'landscape'
    questionCount: number
    choiceCount: 5
    bubbleRegions: BubbleRegion[]
    autoFormIdRegion: AutoFormIdRegion
}

// ============================================
// PREFERENCES TYPES
// ============================================

export interface DenemeOkutPreferences {
    lastSelectedExamId?: string
    cameraAutoCapture: boolean
    alignmentThreshold: number // 0-100
    hapticFeedback: boolean
    soundFeedback: boolean
}
