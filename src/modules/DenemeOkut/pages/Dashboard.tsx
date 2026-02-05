/**
 * DenemeOkut Module - Dashboard Page (Placeholder)
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Camera, FileText, BarChart3, Settings } from 'lucide-react'

export default function DenemeOkutDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Deneme Okut</h1>
                    <p className="text-gray-600">Optik okuma ile hızlı deneme değerlendirmesi</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link
                        to="/deneme-okut/tara"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Tara</h3>
                        <p className="text-sm text-gray-500">Kamera ile optik okuma</p>
                    </Link>

                    <Link
                        to="/deneme-okut/denemeler"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Denemeler</h3>
                        <p className="text-sm text-gray-500">Deneme listesi ve sonuçlar</p>
                    </Link>

                    <Link
                        to="/deneme-okut/denemeler/yeni"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Yeni Deneme</h3>
                        <p className="text-sm text-gray-500">Deneme oluştur</p>
                    </Link>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <Settings className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Ayarlar</h3>
                        <p className="text-sm text-gray-500">Yakında...</p>
                    </div>
                </div>

                {/* Stats Placeholder */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4">İstatistikler</h2>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Toplam Deneme</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Taranan Kağıt</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">İnceleme Bekleyen</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </div>

                {/* PR-1 Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                        <strong>PR-1 Foundation:</strong> Bu sayfa placeholder'dır. Gerçek işlevsellik sonraki PR'larda eklenecek.
                    </p>
                </div>
            </div>
        </div>
    )
}
