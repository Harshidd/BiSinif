/**
 * DenemeOkut Module - Exam List Page (Placeholder)
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'

export default function ExamList() {
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

                {/* Empty State */}
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

                {/* PR-1 Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                        <strong>PR-1 Foundation:</strong> Deneme listesi ve CRUD işlemleri sonraki PR'larda eklenecek.
                    </p>
                </div>
            </div>
        </div>
    )
}
