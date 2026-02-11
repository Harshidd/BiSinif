
import React, { useState, useEffect } from 'react'
import { X, Save, Import, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loadMeta, saveMeta, hasGlobalMeta, importGlobalMeta } from '../storage/docsStorage'
import { getCommonClasses, normalizeClassName } from '../utils/classUtils'

const ContextEditorPanel = ({ isOpen, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        schoolName: '',
        className: '',
        teacherName: ''
    })
    const [canImport, setCanImport] = useState(false)
    const [importSuccess, setImportSuccess] = useState(false)

    const commonClasses = getCommonClasses()

    // Sync from storage when opened
    useEffect(() => {
        if (isOpen) {
            const current = loadMeta() || {}
            setFormData({
                schoolName: current.schoolName || '',
                className: current.className || '',
                teacherName: current.teacherName || ''
            })
            setCanImport(hasGlobalMeta())
        }
    }, [isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = () => {
        // Normalize class name
        const cleanData = {
            ...formData,
            className: normalizeClassName(formData.className)
        }

        saveMeta(cleanData)
        if (onUpdate) onUpdate()
        onClose()
    }

    const handleImport = () => {
        importGlobalMeta()
        // Reload local form state from new storage
        const newData = loadMeta() || {}
        setFormData({
            schoolName: newData.schoolName || '',
            className: newData.className || '',
            teacherName: newData.teacherName || ''
        })
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 2000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in p-4">
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all scale-100"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Belge Bağlamını Düzenle</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Import Action */}
                    {canImport && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mb-2">
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Mevcut Sınıf Bilgileri</p>
                                <p className="text-blue-600/80 text-xs">Diğer modüllerdeki aktif sınıfı kopyala</p>
                            </div>
                            <button
                                onClick={handleImport}
                                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 active:scale-95"
                            >
                                {importSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Alındı</span>
                                    </>
                                ) : (
                                    <>
                                        <Import className="w-3.5 h-3.5" />
                                        <span>Kopyala</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Okul Adı</label>
                            <input
                                type="text"
                                name="schoolName"
                                value={formData.schoolName}
                                onChange={handleChange}
                                placeholder="Örn: Atatürk Ortaokulu"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sınıf</label>
                            <input
                                type="text"
                                name="className"
                                list="commonClassesList"
                                value={formData.className}
                                onChange={handleChange}
                                placeholder="Örn: 6A"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-300 uppercase"
                            />
                            <datalist id="commonClassesList">
                                {commonClasses.map(cls => (
                                    <option key={cls} value={cls} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Öğretmen Adı</label>
                            <input
                                type="text"
                                name="teacherName"
                                value={formData.teacherName}
                                onChange={handleChange}
                                placeholder="Örn: Ahmet Yılmaz"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                        <AlertCircle className="w-4 h-4 shrink-0 text-gray-400" />
                        <p>Bu bilgiler sadece oluşturulacak belgelerde kullanılır. Diğer modülleri etkilemez.</p>
                    </div>
                </div>

                {/* Footer */}
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
            </div>
        </div>
    )
}

export default ContextEditorPanel
