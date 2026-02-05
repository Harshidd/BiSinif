/**
 * DenemeOkut Module - Create Exam Page (Placeholder)
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function CreateExam() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/deneme-okut/denemeler')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Geri
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Deneme Oluştur</h1>
                    <p className="text-gray-600">Deneme bilgilerini girin ve cevap anahtarını tanımlayın</p>
                </div>

                {/* Form Placeholder */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deneme Adı</label>
                            <input
                                type="text"
                                placeholder="Örn: Matematik 1. Deneme"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Şablon</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled
                            >
                                <option>MEB 5 Seçenek - 20 Soru (A4)</option>
                                <option>MEB 5 Seçenek - 40 Soru (A4)</option>
                                <option>MEB 5 Seçenek - 80 Soru (A4)</option>
                                <option>MEB 5 Seçenek - 100 Soru (A4)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cevap Anahtarı</label>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-500 text-center">
                                    Cevap anahtarı girişi sonraki PR'larda eklenecek
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => navigate('/deneme-okut/denemeler')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                disabled
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>

                {/* PR-1 Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                        <strong>PR-1 Foundation:</strong> Form işlevselliği ve cevap anahtarı girişi sonraki PR'larda eklenecek.
                    </p>
                </div>
            </div>
        </div>
    )
}
