import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '../ui/Card'
import { User, Printer, Building2, Calendar, Download, FileDown } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/Alert'
import { Button } from '../ui/Button'
import { exportSingleStudentPDF, exportStudentCardsPDF } from '../report/pdfExport'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export const StudentReportSection = ({ analysis, config }) => {
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [isExporting, setIsExporting] = useState(false)
    const [isExportingAll, setIsExportingAll] = useState(false)
    const students = analysis?.studentResults ?? []

    // 1) ID Güvenliği: Number vs String mismatch önlemi
    const selectedStudent = useMemo(() => {
        if (!selectedStudentId) return null
        return students.find(s => String(s.id) === String(selectedStudentId)) || null
    }, [selectedStudentId, students])

    // Helper: Safe Number
    const getSafeTotal = (val) => {
        const n = Number(val)
        return Number.isFinite(n) ? n : 0
    }

    // 4) Strong/Weak outcomes safe accessor
    const toOutcomeName = (o) => {
        if (!o) return '-'
        if (typeof o === 'object') return o.title ?? o.name ?? '-'
        return String(o)
    }

    // Helpers
    const studentComment = useMemo(() => {
        if (!selectedStudent) return ''
        const s = selectedStudent

        // Arrays might be null/undefined
        const strong = (s.strongOutcomes || []).map(toOutcomeName).join(', ')
        const weak = (s.weakOutcomes || []).map(toOutcomeName).join(', ')

        let parts = []
        if (s.isPassing) parts.push("Genel performansınız başarılı düzeyde.")
        else parts.push("Genel başarınızı artırmanız önerilir.")

        if (strong) parts.push(`Başarılı olduğunuz konular: ${strong}.`)
        if (weak) parts.push(`Geliştirmeniz gereken konular: ${weak}.`)

        return parts.join(' ')
    }, [selectedStudent])

    // 3) Chart Data Null Safety
    const chartData = useMemo(() => {
        if (!selectedStudent) return []
        const outcomeStats = analysis?.outcomes ?? []
        const outcomeTitles = config?.outcomes ?? []

        return outcomeTitles.map((outcomeTitle, idx) => {
            const studentScore = selectedStudent.outcomeScores?.[idx] ?? 0
            const classAvg = outcomeStats[idx]?.avgScore ?? 0

            return {
                name: `S${idx + 1}`,
                'Öğrenci': getSafeTotal(studentScore),
                'Sınıf': getSafeTotal(classAvg),
                fullTitle: outcomeTitle || `Kazanım ${idx + 1}`
            }
        })
    }, [selectedStudent, analysis, config])

    const handlePrint = () => window.print()

    // Tek öğrenci PDF export
    const handlePDFExport = async () => {
        if (!selectedStudent) return
        try {
            setIsExporting(true)
            await exportSingleStudentPDF({
                analysis,
                config,
                student: selectedStudent
            })
        } catch (error) {
            console.error('[PDF] Export Error:', error)
            alert('PDF oluşturulurken bir hata oluştu: ' + (error?.message || error))
        } finally {
            setIsExporting(false)
        }
    }

    // Tüm öğrencilerin karnelerini PDF olarak indir (1 öğrenci / 1 sayfa)
    const handleAllCardsPDF = async () => {
        if (students.length === 0) {
            alert('İndirilecek öğrenci karnesi bulunmuyor.')
            return
        }
        try {
            setIsExportingAll(true)
            await exportStudentCardsPDF({
                analysis,
                config,
                students
            })
        } catch (error) {
            console.error('[PDF] All Cards Export Error:', error)
            alert('PDF oluşturulurken bir hata oluştu: ' + (error?.message || error))
        } finally {
            setIsExportingAll(false)
        }
    }

    // Safe Total for Student
    const safeStudentTotal = selectedStudent ? getSafeTotal(selectedStudent.total) : 0
    const safeStudentName = selectedStudent ? (selectedStudent.name ?? 'İsimsiz') : ''
    const safeStudentNo = selectedStudent ? (selectedStudent.no ?? selectedStudent.studentNumber ?? '-') : ''
    const safeStudentRank = selectedStudent ? (selectedStudent.rank ?? '-') : '-'

    const outcomeTitles = config?.outcomes ?? []
    const outcomeMasteryThreshold = config?.outcomeMasteryThreshold ?? 50
    const schoolName = config?.schoolName ?? 'Okul Adı Girilmedi'

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Öğrenci Karnesi</h2>
                    <p className="text-slate-500">Bireysel öğrenci performans raporu</p>
                </div>
                {/* Tüm Karneleri İndir Butonu */}
                {students.length > 0 && (
                    <Button
                        onClick={handleAllCardsPDF}
                        disabled={isExportingAll}
                        variant="outline"
                        className="no-print"
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        {isExportingAll ? 'Hazırlanıyor...' : `Tüm Karneler (${students.length})`}
                    </Button>
                )}
            </div>

            {/* Selector Card */}
            <Card className="border border-blue-100 shadow-sm bg-blue-50/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-medium text-blue-900 mb-1.5 block">Öğrenci Seçin</label>
                            <select
                                className="w-full p-2.5 rounded-lg border border-blue-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">-- Listeden Seçin --</option>
                                {students.map(s => {
                                    // 5) Safe display in dropdown
                                    const name = s.name ?? 'İsimsiz'
                                    const no = s.no ?? s.studentNumber ?? '-'
                                    const t = getSafeTotal(s.total).toFixed(0)
                                    return (
                                        <option key={s.id} value={s.id}>
                                            {no} - {name} ({t} Puan)
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                        {selectedStudent && (
                            <div className="flex gap-2 self-end no-print">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePDFExport}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isExporting ? 'Hazırlanıyor...' : 'PDF İndir'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="w-4 h-4 mr-2" /> Yazdır
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Report Content */}
            {selectedStudent ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-border-none">
                    {/* Header */}
                    <div className={`px-6 py-6 ${selectedStudent.isPassing ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                        <div className="flex justify-between items-center text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <User className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{safeStudentName}</h2>
                                    <p className="text-white/90 font-medium opacity-90">No: {safeStudentNo}</p>
                                </div>
                            </div>
                            <div className="text-center bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <div className="text-sm font-medium opacity-90">DURUM</div>
                                <div className="text-xl font-bold">{selectedStudent.isPassing ? 'GEÇTİ' : 'TEKRAR'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Stats */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Puan Durumu</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                        <div className="text-3xl font-bold text-slate-800">{safeStudentTotal.toFixed(0)}</div>
                                        <div className="text-xs text-slate-500 mt-1">Toplam Puan</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                                        <div className="text-3xl font-bold text-slate-800">
                                            {students.length > 0 ? (
                                                <span className="text-lg">{safeStudentRank}. / {students.length}</span>
                                            ) : '-'}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Sınıf Sırası</div>
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-blue-50 border-blue-100">
                                <AlertDescription className="text-blue-800 text-sm italic">
                                    "{studentComment}"
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Middle Column: Chart */}
                        <div className="lg:col-span-2">
                            <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Kazanım Karşılaştırması</h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Öğrenci" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Öğrenci" />
                                        <Bar dataKey="Sınıf" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Sınıf Ort." />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bottom: Detailed Table */}
                        <div className="lg:col-span-3">
                            <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Detaylı Kazanım Performansı</h4>
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Kazanım</th>
                                            <th className="px-4 py-3 text-center">Puan</th>
                                            <th className="px-4 py-3 text-center">Başarı %</th>
                                            <th className="px-4 py-3 text-center">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {outcomeTitles.map((outcome, i) => {
                                            const score = getSafeTotal(selectedStudent.outcomeScores?.[i])
                                            const max = getSafeTotal(analysis?.outcomes?.[i]?.maxScore)
                                            const pct = max > 0 ? (score / max * 100) : 0
                                            const isMastered = pct >= outcomeMasteryThreshold

                                            return (
                                                <tr key={i} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium text-slate-700">
                                                        <span className="text-xs text-slate-400 mr-2">K{i + 1}</span>
                                                        {outcome || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-slate-600">
                                                        {score.toFixed(1)} <span className="text-slate-300">/ {max}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                                                        %{pct.toFixed(0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {isMastered ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                                Başarılı
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                Geliştirilmeli
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {outcomeTitles.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-slate-400 italic">
                                                    Kazanım verisi bulunmuyor
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {schoolName}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Raporunu görüntülemek için yukarıdan bir öğrenci seçin.</p>
                </div>
            )}
        </div>
    )
}
