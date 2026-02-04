import React, { useState, useEffect } from 'react'
import { loadMeta, saveMeta } from '../storage/classStorage'
import { Save, CheckCircle2, Building, User, Calendar, FileText } from 'lucide-react'

export default function ClassSettingsPage() {
    const [formData, setFormData] = useState({
        schoolName: '',
        className: '',
        teacherName: '',
        term: '',
        notes: ''
    })
    const [status, setStatus] = useState('idle')

    useEffect(() => {
        const meta = loadMeta() || {}
        setFormData({
            schoolName: meta.schoolName || '',
            className: meta.className || '',
            teacherName: meta.teacherName || '',
            term: meta.term || '',
            notes: meta.notes || ''
        })
    }, [])

    const handleSave = () => {
        setStatus('saving')

        // Preserve other meta fields if any (like version, migratedAt)
        const currentMeta = loadMeta() || {}

        saveMeta({
            ...currentMeta,
            ...formData,
            updatedAt: new Date().toISOString()
        })

        setTimeout(() => {
            setStatus('saved')
            setTimeout(() => setStatus('idle'), 2000)
        }, 500)
    }

    return (
        <div className="pb-20 space-y-6 animate-fade-in max-w-2xl mx-auto">

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h1 className="text-xl font-bold text-gray-900">Sınıf Ayarları</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Bu bilgiler oturma planı raporlarının başlık kısımlarında kullanılır.
                </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-6">

                    {/* School & Class */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" /> Okul Adı
                            </label>
                            <input
                                type="text"
                                value={formData.schoolName}
                                onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                                placeholder="Örn: Cumhuriyet Fen Lisesi"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" /> Sınıf / Şube Adı
                            </label>
                            <input
                                type="text"
                                value={formData.className}
                                onChange={e => setFormData({ ...formData, className: e.target.value })}
                                placeholder="Örn: 10/A"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Teacher & Term */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" /> Sınıf Öğretmeni
                            </label>
                            <input
                                type="text"
                                value={formData.teacherName}
                                onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                                placeholder="Ad Soyad"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" /> Eğitim Dönemi
                            </label>
                            <input
                                type="text"
                                value={formData.term}
                                onChange={e => setFormData({ ...formData, term: e.target.value })}
                                placeholder="Örn: 2024-2025"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" /> Açıklama / Not (Opsiyonel)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Raporlarda görünmesini istediğiniz ekstra bir not..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none"
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-6 flex justify-end items-center border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        className={`
                            px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-200
                            ${status === 'saved' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                            active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                        `}
                    >
                        {status === 'saving' && <span className="animate-spin">⌛</span>}
                        {status === 'saved' ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {status === 'saved' ? 'Kaydedildi' : 'Ayarları Kaydet'}
                    </button>
                </div>
            </div>

        </div>
    )
}
