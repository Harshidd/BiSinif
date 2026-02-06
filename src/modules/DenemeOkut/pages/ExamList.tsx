/**
 * DenemeOkut Module - Exam List Page
 */

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, ChevronRight, Calendar, ListChecks, Hash } from 'lucide-react'
import { db } from '../db'
import type { DenemeOkutExamOutput } from '../schemas'

export default function ExamList() {
    const [exams, setExams] = useState<DenemeOkutExamOutput[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        db.getExamsByDate()
            .then(data => {
                setExams(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load exams:', err)
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Denemeler</h1>
                        <p className="text-gray-600">Oluşturduğunuz denemelerin listesi</p>
                    </div>
                    <Link
                        to="/deneme-okut/denemeler/yeni"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Deneme
                    </Link>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
                ) : exams.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz deneme yok</h3>
                        <p className="text-gray-500 mb-6">İlk denemenizi oluşturarak başlayın</p>
                        <Link
                            to="/deneme-okut/denemeler/yeni"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Yeni Deneme Oluştur
                        </Link>
                    </div>
                ) : (
                    /* Exam List */
                    <div className="grid grid-cols-1 gap-4">
                        {exams.map(exam => (
                            <Link
                                key={exam.id}
                                to="#" // No details page yet
                                className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {exam.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <ListChecks className="w-4 h-4" />
                                                <span>{exam.templateName || 'Şablon Belirtilmemiş'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Hash className="w-4 h-4" />
                                                <span>{exam.questionCount} Soru</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(exam.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
