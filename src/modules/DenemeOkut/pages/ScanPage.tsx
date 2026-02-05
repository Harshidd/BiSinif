/**
 * DenemeOkut Module - Scan Page (Placeholder)
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ArrowLeft, Upload } from 'lucide-react'

export default function ScanPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/deneme-okut')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Geri
                </button>

                {/* Camera Preview Placeholder */}
                <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
                    <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Camera className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Kamera Önizlemesi</h3>
                            <p className="text-gray-400">PR-2'de guided capture eklenecek</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        disabled
                    >
                        <Camera className="w-5 h-5" />
                        Kamera ile Tara
                    </button>
                    <button
                        className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        disabled
                    >
                        <Upload className="w-5 h-5" />
                        Galeriden Yükle
                    </button>
                </div>

                {/* Batch Queue Placeholder */}
                <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Tarama Kuyruğu</h3>
                    <div className="text-center py-8">
                        <p className="text-gray-400">Henüz tarama yok</p>
                        <p className="text-sm text-gray-500 mt-2">PR-3'te batch queue UI eklenecek</p>
                    </div>
                </div>

                {/* PR-1 Notice */}
                <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                    <p className="text-sm text-blue-200">
                        <strong>PR-1 Foundation:</strong> Kamera önizlemesi, alignment detection ve batch queue PR-2/PR-3'te eklenecek.
                    </p>
                </div>
            </div>
        </div>
    )
}
