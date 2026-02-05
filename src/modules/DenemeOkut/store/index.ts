/**
 * DenemeOkut Module - Zustand Store
 * 
 * HARD RULES:
 * - Strict TypeScript (no any)
 * - localStorage only for small prefs
 * - Primary data in IndexedDB
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DenemeOkutExam, ScanJob, DenemeOkutPreferences } from '../types'
import { db } from '../db'

// ============================================
// STORE STATE
// ============================================

interface DenemeOkutState {
    // Preferences (persisted to localStorage)
    preferences: DenemeOkutPreferences

    // Runtime state (not persisted)
    currentExam: DenemeOkutExam | null
    recentExams: DenemeOkutExam[]
    scansInProgress: ScanJob[]
    isLoading: boolean
    error: string | null

    // Actions
    setPreferences: (prefs: Partial<DenemeOkutPreferences>) => void
    setCurrentExam: (exam: DenemeOkutExam | null) => void
    loadRecentExams: () => Promise<void>
    loadScansForExam: (examId: string) => Promise<void>
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void
}

// ============================================
// DEFAULT PREFERENCES
// ============================================

const DEFAULT_PREFERENCES: DenemeOkutPreferences = {
    cameraAutoCapture: true,
    alignmentThreshold: 90,
    hapticFeedback: true,
    soundFeedback: false,
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useDenemeOkutStore = create<DenemeOkutState>()(
    persist(
        (set, get) => ({
            // Initial state
            preferences: DEFAULT_PREFERENCES,
            currentExam: null,
            recentExams: [],
            scansInProgress: [],
            isLoading: false,
            error: null,

            // Actions
            setPreferences: (prefs) => {
                set((state) => ({
                    preferences: { ...state.preferences, ...prefs },
                }))
            },

            setCurrentExam: (exam) => {
                set({ currentExam: exam })
                if (exam) {
                    set((state) => ({
                        preferences: { ...state.preferences, lastSelectedExamId: exam.id },
                    }))
                }
            },

            loadRecentExams: async () => {
                try {
                    set({ isLoading: true, error: null })
                    const exams = await db.getExamsByDate(10)
                    set({ recentExams: exams, isLoading: false })
                } catch (error) {
                    console.error('[DenemeOkut] Failed to load recent exams:', error)
                    set({ error: 'Denemeler yüklenemedi', isLoading: false })
                }
            },

            loadScansForExam: async (examId) => {
                try {
                    set({ isLoading: true, error: null })
                    const scans = await db.getScansByExam(examId)
                    set({ scansInProgress: scans, isLoading: false })
                } catch (error) {
                    console.error('[DenemeOkut] Failed to load scans:', error)
                    set({ error: 'Taramalar yüklenemedi', isLoading: false })
                }
            },

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),

            reset: () => {
                set({
                    currentExam: null,
                    recentExams: [],
                    scansInProgress: [],
                    isLoading: false,
                    error: null,
                })
            },
        }),
        {
            name: 'bisinif.denemeokut.v1.prefs', // localStorage key
            partialize: (state) => ({
                preferences: state.preferences, // Only persist preferences
            }),
        }
    )
)
