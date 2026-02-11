
import React, { useState, useEffect } from 'react'
import { X, Save, Clipboard } from 'lucide-react'
import { loadMeta, saveMeta } from '../storage/docsStorage'
import { getCommonClasses, normalizeClassName } from '../utils/classUtils'

const COMMON_LESSONS = [
    'Türkçe',
    'Matematik',
    'Fen Bilimleri',
    'Sosyal Bilgiler',
    'İngilizce',
    'Din Kültürü',
    'Bilişim Teknolojileri',
    'Görsel Sanatlar',
    'Müzik',
    'Beden Eğitimi',
    'Teknoloji ve Tasarım',
    'Rehberlik'
]

const StudentContextPanel = ({ isOpen, onClose, onConfirm, initialValues = {} }) => {
    // Local state for the form
    const [formData, setFormData] = useState({
        className: '',
        studentName: '',
        lessonName: ''
    })

    // Paste mode state
    const [isPasteMode, setIsPasteMode] = useState(false)
    const [pasteContent, setPasteContent] = useState('')

    const commonClasses = getCommonClasses()

    // Sync from storage or props when opened
    useEffect(() => {
        if (isOpen) {
            const currentMeta = loadMeta() || {}
            setFormData({
                className: currentMeta.className || '',
                studentName: initialValues.studentName || '',
                lessonName: initialValues.lessonName || ''
            })
            // Reset paste mode
            setIsPasteMode(false)
            setPasteContent('')
        }
    }, [isOpen, initialValues])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = () => {
        // 1. Save Class to Docs Storage
        const currentMeta = loadMeta() || {}
        const cleanClass = normalizeClassName(formData.className)

        saveMeta({
            ...currentMeta,
            className: cleanClass
        })

        // 2. Pass in-memory data back to parent
        onConfirm({
            className: cleanClass,
            studentName: formData.studentName,
            lessonName: formData.lessonName
        })

        onClose()
    }

    const handlePasteProcess = () => {
        if (!pasteContent) return

        // Simple heuristic: Try to find a name pattern.
        // E-Okul often: "123  ALI VELI  12345678901"
        const lines = pasteContent.split('\n').filter(l => l.trim().length > 0)
        if (lines.length > 0) {
            let raw = lines[0]
            // Remove digits
            let clean = raw.replace(/[0-9]/g, '').trim()
            // Remove extra spaces
            clean = clean.replace(/\s+/g, ' ')

            setFormData(prev => ({ ...prev, studentName: clean }))
        }

        setIsPasteMode(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in p-4">
            <div
                className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all scale-100"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Öğrenci ve Sınıf</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Row 1: Check inputs */}
                    {!isPasteMode ? (
                        <div className="space-y-3">
                            {/* Class Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Sınıf</label>
                                <input
                                    type="text"
                                    name="className"
                                    list="studentContextClasses"
                                    value={formData.className}
                                    onChange={handleChange}
                                    placeholder="Örn: 6A"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all uppercase"
                                />
                                <datalist id="studentContextClasses">
                                    {commonClasses.map(cls => (
                                        <option key={cls} value={cls} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Lesson Name (New) */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Ders (Opsiyonel)</label>
                                <input
                                    type="text"
                                    name="lessonName"
                                    list="commonLessonsList"
                                    value={formData.lessonName}
                                    onChange={handleChange}
                                    placeholder="Örn: Matematik"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                                />
                                <datalist id="commonLessonsList">
                                    {COMMON_LESSONS.map(l => (
                                        <option key={l} value={l} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Student Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Öğrenci Adı</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleChange}
                                        placeholder="Örn: Ali Veli"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setIsPasteMode(true)}
                                className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-blue-100 border-dashed"
                            >
                                <Clipboard className="w-3.5 h-3.5" />
                                E-Okul'dan Yapıştır
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-fade-in">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Satırı Yapıştır (İsim Otomatik Alınır)
                            </label>
                            <textarea
                                value={pasteContent}
                                onChange={(e) => setPasteContent(e.target.value)}
                                className="w-full h-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                placeholder="Örn: 123  ALI VELI  ..."
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsPasteMode(false)}
                                    className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200"
                                >
                                    Geri
                                </button>
                                <button
                                    onClick={handlePasteProcess}
                                    className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                                >
                                    İsmi Al
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isPasteMode && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200/50 rounded-xl transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Kaydet
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentContextPanel
