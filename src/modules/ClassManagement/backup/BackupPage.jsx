import React, { useState, useRef } from 'react'
import { Download, Upload, FileJson, AlertTriangle, CheckCircle, RefreshCw, Archive, Database, ArrowRight, Layout } from 'lucide-react'
import { backupService } from './backupService'

const BackupPage = () => {
    const [status, setStatus] = useState({ type: null, msg: '' })
    const fileInputRef = useRef(null)

    // Preview Modal State
    const [preview, setPreview] = useState(null)
    const [restoreMode, setRestoreMode] = useState('merge') // 'merge' | 'overwrite'
    const [includeActivePlan, setIncludeActivePlan] = useState(false)

    // --- Actions ---

    const handleExport = () => {
        try {
            const backup = backupService.createBackup()
            backupService.downloadBackup(backup)
            setStatus({ type: 'success', msg: 'Yedek dosyası başarıyla oluşturuldu ve indirildi.' })
        } catch (e) {
            setStatus({ type: 'error', msg: 'Yedekleme sırasında bir hata oluştu: ' + e.message })
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            setStatus({ type: 'error', msg: 'Dosya boyutu çok büyük (Maks 2MB).' })
            e.target.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target.result
            const validation = backupService.validateOrParse(content)

            if (validation.valid) {
                setPreview(validation)
                setStatus({ type: null, msg: '' })
                setIncludeActivePlan(false) // Reset default
            } else {
                setStatus({ type: 'error', msg: validation.error })
                setPreview(null)
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    const handleRestore = () => {
        if (!preview || !preview.data) return

        setStatus({ type: 'loading', msg: 'Geri yükleniyor...' })

        setTimeout(() => {
            let result
            if (restoreMode === 'overwrite') {
                result = backupService.restore(preview.data, 'overwrite')
            } else {
                result = backupService.restore(preview.data, 'merge', { includeActivePlan })
            }

            if (result.success) {
                setStatus({ type: 'success', msg: result.log })
                if (result.details && result.details.length > 0) {
                    console.log('Restore Logs:', result.details)
                }
                setPreview(null)
            } else {
                setStatus({ type: 'error', msg: 'Geri yükleme hatası: ' + result.error })
            }
        }, 800)
    }

    // --- UI Components ---

    return (
        <div className="animate-fade-in space-y-8">

            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Database className="w-64 h-64 -mr-16 -mt-16" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center space-x-3 mb-4 text-emerald-400">
                        <Archive className="w-6 h-6" />
                        <span className="text-sm font-bold uppercase tracking-wider">Veri Yönetimi v1.0.1</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Yedekleme ve Geri Yükleme</h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Sınıf verilerinizi güvenle yedekleyin. Akıllı birleştirme desteğiyle veri kaybı yaşamadan farklı cihazlardaki çalışmalarınızı senkronize edin.
                    </p>
                </div>
            </div>

            {/* Status Feedback */}
            {status.msg && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                        status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                    {status.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> :
                        status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                            <RefreshCw className="w-5 h-5 animate-spin flex-shrink-0" />}
                    <span className="font-medium">{status.msg}</span>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">

                {/* Export Card */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Download className="w-6 h-6" />
                    </div>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Yedek Al (Export)</h2>
                        <ul className="text-sm text-gray-500 space-y-1">
                            <li>• Sınıf Listesi & Profiller</li>
                            <li>• Oturma Planı Geçmişi</li>
                            <li>• Oturma Kuralları & Ayarları</li>
                            <li className="text-xs text-gray-400 pt-1">* Sınav sonuçları dahil değildir.</li>
                        </ul>
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <FileJson className="w-5 h-5" />
                        <span>Güvenli Yedek İndir (.json)</span>
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Geri Yükle (Import)</h2>
                        <p className="text-sm text-gray-500">
                            Yedek dosyasını yükleyin. Verilerinizi mevcut listeyle birleştirme veya tamamen değiştirme seçenekleri sunulacaktır.
                        </p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-purple-500 hover:text-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Dosya Seç (Max 2MB)</span>
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {preview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                        >
                            ✕
                        </button>

                        <div className="mb-6 flex items-center gap-3 text-purple-600">
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <FileJson className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Yedek Analizi</h3>
                                <p className="text-xs text-gray-500">
                                    {new Date(preview.stats.createdAt).toLocaleString('tr-TR')}
                                </p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">İçerik</div>
                                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                                    <span>Öğrenci:</span>
                                    <span className="text-gray-900 font-bold">{preview.stats.studentCount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                                    <span>Plan Geçmişi:</span>
                                    <span className="text-gray-900 font-bold">{preview.stats.historyCount}</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <div className="text-xs uppercase font-bold text-blue-400 tracking-wider mb-1">Tahmini Etki</div>
                                <div className="flex justify-between items-center text-sm font-medium text-blue-800">
                                    <span>Yeni Eklenecek:</span>
                                    <span className="font-bold">~{preview.stats.newStudentsApprox}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium text-blue-800">
                                    <span>Güncellenecek:</span>
                                    <span className="font-bold">~{preview.stats.updateStudentsApprox}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="font-semibold text-gray-700 border-b pb-2">Yükleme Seçenekleri:</p>

                            {/* Merge Option */}
                            <label className={`block relative p-4 rounded-xl border-2 cursor-pointer transition-all ${restoreMode === 'merge' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="restoreMode"
                                        value="merge"
                                        checked={restoreMode === 'merge'}
                                        onChange={() => setRestoreMode('merge')}
                                        className="mt-1"
                                    />
                                    <div>
                                        <span className="font-bold text-gray-900 block">Akıllı Birleştirme (Önerilen)</span>
                                        <span className="text-sm text-gray-600">Mevcut verileri korur. Yeni öğrencileri ekler, çakışanları günceller.</span>

                                        {/* Nested Option: Include Active Plan */}
                                        <div className={`mt-3 pl-4 border-l-2 border-purple-200 transition-all ${restoreMode === 'merge' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={includeActivePlan}
                                                    onChange={(e) => setIncludeActivePlan(e.target.checked)}
                                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                                                    Aktif Oturma Planını da Yükle
                                                </span>
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                                İşaretlenmezse, sadece öğrenci listesi ve geçmiş birleştirilir. Mevcut masa düzeniniz bozulmaz.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            {/* Overwrite Option */}
                            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${restoreMode === 'overwrite' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="restoreMode"
                                        value="overwrite"
                                        checked={restoreMode === 'overwrite'}
                                        onChange={() => setRestoreMode('overwrite')}
                                        className="mt-1"
                                    />
                                    <div>
                                        <span className="font-bold text-red-700 block">Tamamen Üzerine Yaz</span>
                                        <span className="text-sm text-gray-600">
                                            DİKKAT: Cihazdaki tüm sınıf verilerini siler ve yedekteki verileri yazar. Geri alınamaz.
                                        </span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setPreview(null)}
                                className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleRestore}
                                className={`flex-1 py-3 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${restoreMode === 'overwrite' ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200'
                                    }`}
                            >
                                {restoreMode === 'overwrite' ? 'SİL ve Yükle' : 'Birleştir ve Yükle'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BackupPage
