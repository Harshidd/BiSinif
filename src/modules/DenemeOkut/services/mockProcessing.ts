/**
 * DenemeOkut Module - Mock Processing Service
 * 
 * HARD RULES:
 * - Deterministic: same input => same output
 * - Hash-based pseudo-random results
 * - NO real image processing in PR-1
 * - Confidence scores: 40-95% range
 */

import type { ScanJob, AnswerChoice, ScanFlag } from '../types'

// ============================================
// DETERMINISTIC HASH FUNCTION
// ============================================

function simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
}

// ============================================
// SEEDED RANDOM (Deterministic)
// ============================================

class SeededRandom {
    private seed: number

    constructor(seed: number) {
        this.seed = seed
    }

    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280
        return this.seed / 233280
    }

    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min
    }

    nextFloat(min: number, max: number): number {
        return this.next() * (max - min) + min
    }

    choice<T>(arr: T[]): T {
        return arr[this.nextInt(0, arr.length - 1)]
    }
}

// ============================================
// MOCK PROCESSING SERVICE
// ============================================

export interface MockProcessingResult {
    answers: Record<number, AnswerChoice | null>
    confidence: Record<number, number>
    flags: Record<number, ScanFlag[]>
    processingTimeMs: number
}

export class MockProcessingService {
    /**
     * Process a scan job deterministically
     * 
     * @param examId - Exam ID (for deterministic seed)
     * @param imageIdentifier - Image hash or filename (for deterministic seed)
     * @param questionCount - Number of questions in exam
     * @returns Stable pseudo-result
     */
    static process(examId: string, imageIdentifier: string, questionCount: number): MockProcessingResult {
        const startTime = performance.now()

        // Create deterministic seed from examId + imageIdentifier
        const seed = simpleHash(examId + imageIdentifier)
        const rng = new SeededRandom(seed)

        const answers: Record<number, AnswerChoice | null> = {}
        const confidence: Record<number, number> = {}
        const flags: Record<number, ScanFlag[]> = {}

        const choices: AnswerChoice[] = ['A', 'B', 'C', 'D', 'E']

        for (let q = 1; q <= questionCount; q++) {
            // 95% chance of having an answer (5% no mark)
            const hasAnswer = rng.next() > 0.05

            if (hasAnswer) {
                // Pick a random answer
                answers[q] = rng.choice(choices)

                // Confidence: 40-95% range (most are high)
                const confidenceRoll = rng.next()
                if (confidenceRoll < 0.7) {
                    // 70% high confidence (80-95%)
                    confidence[q] = rng.nextFloat(0.8, 0.95)
                } else if (confidenceRoll < 0.9) {
                    // 20% medium confidence (60-80%)
                    confidence[q] = rng.nextFloat(0.6, 0.8)
                    flags[q] = ['LOW_CONFIDENCE']
                } else {
                    // 10% low confidence (40-60%)
                    confidence[q] = rng.nextFloat(0.4, 0.6)
                    flags[q] = ['LOW_CONFIDENCE', 'AMBIGUOUS']
                }

                // 5% chance of multi-mark flag
                if (rng.next() < 0.05) {
                    flags[q] = [...(flags[q] || []), 'MULTI_MARK']
                    confidence[q] = Math.min(confidence[q], 0.6) // Lower confidence
                }

                // 3% chance of erasure flag
                if (rng.next() < 0.03) {
                    flags[q] = [...(flags[q] || []), 'ERASURE']
                    confidence[q] = Math.min(confidence[q], 0.7) // Lower confidence
                }
            } else {
                // No mark detected
                answers[q] = null
                confidence[q] = 0
                flags[q] = ['NO_MARK']
            }
        }

        const processingTimeMs = performance.now() - startTime

        return {
            answers,
            confidence,
            flags,
            processingTimeMs,
        }
    }

    /**
     * Batch process multiple scans
     * 
     * @param jobs - Array of {examId, imageIdentifier, questionCount}
     * @returns Array of results (same order as input)
     */
    static processBatch(
        jobs: Array<{ examId: string; imageIdentifier: string; questionCount: number }>
    ): MockProcessingResult[] {
        return jobs.map((job) => this.process(job.examId, job.imageIdentifier, job.questionCount))
    }
}

// ============================================
// DEV HELPER: Test Determinism
// ============================================

export function testDeterminism(): void {
    if (import.meta.env.DEV) {
        const result1 = MockProcessingService.process('exam-123', 'image-abc', 40)
        const result2 = MockProcessingService.process('exam-123', 'image-abc', 40)

        const match = JSON.stringify(result1.answers) === JSON.stringify(result2.answers)
        console.log('[DenemeOkut] Determinism test:', match ? '✅ PASS' : '❌ FAIL')
        console.log('Result 1:', result1.answers)
        console.log('Result 2:', result2.answers)
    }
}
