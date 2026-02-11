
import React, { useState, useEffect } from 'react'
import { AlertCircle, User, School, BookOpen, Import, CheckCircle2 } from 'lucide-react'
import { loadMeta, hasGlobalMeta, importGlobalMeta } from '../storage/docsStorage'

const ClassSelectorPill = () => {
    const [meta, setMeta] = useState(null)
    const [loading, setLoading] = useState(true)
    const [canImport, setCanImport] = useState(false)
    const [importSuccess, setImportSuccess] = useState(false)

    // Load initial state
    useEffect(() => {
        const updateState = () => {
            const loaded = loadMeta() || {}
            setMeta(loaded)
            setCanImport(hasGlobalMeta())
            setLoading(false)
        }

        updateState()
        window.addEventListener('storage', updateState)
        return () => window.removeEventListener('storage', updateState)
    }, [])

    const handleImport = () => {
        importGlobalMeta() // Copies global -> Docs
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 2000)
    }

    if (loading) return <div className="animate-pulse h-8 w-32 bg-gray-200 rounded-full"></div>

    const hasInfo = meta?.schoolName && meta?.className

    // Empty State: Offer Import
    if (!hasInfo) {
        return (
            <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Sınıf seçilmedi</span>
                </div>

                {canImport && (
                    <button
                        onClick={handleImport}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium rounded-full transition-colors active:scale-95"
                        title="Sınıf Yönetimi'ndeki mevcut sınıf bilgisini kopyala"
                    >
                        {importSuccess ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Alındı</span>
                            </>
                        ) : (
                            <>
                                <Import className="w-3.5 h-3.5" />
                                <span>Mevcut Sınıfı Al</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        )
    }

    // Active State (Docs Context)
    return (
        <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-700">
                <div className="flex items-center gap-1.5 font-medium text-gray-900 border-r border-gray-200 pr-3 mr-1">
                    <School className="w-4 h-4 text-gray-500" />
                    <span className="truncate max-w-[120px]">{meta.schoolName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-blue-700">{meta.className}</span>
                </div>

                {meta.teacherName && (
                    <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-200 pl-3 ml-1 text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[100px]">{meta.teacherName}</span>
                    </div>
                )}
            </div>

            {/* Sync Refresh Button (Optional - Manual Re-sync) */}
            {canImport && (
                <button
                    onClick={handleImport}
                    className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-full border border-gray-200 transition-colors"
                    title="Mevcut sınıf bilgisiyle güncelle"
                >
                    <Import className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

export default ClassSelectorPill
