import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Target, CheckCircle2, XCircle, Users } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'

export const OutcomeAnalysisSection = ({ analysis, config }) => {
    // Safe Access
    const outcomes = analysis?.outcomes ?? []
    const outcomeStats = outcomes // alias
    const masteryThreshold = config?.outcomeMasteryThreshold ?? 50

    // Adapter for Failure Matrix (from Dashboard Refactor)
    const failureMatrix = useMemo(() => {
        const rows = analysis?.failureMatrix?.rows || []
        return rows.map(r => ({
            ...r,
            failedStudents: r.failingStudents || [],
            failedCount: (r.failingStudents || []).length,
            isAllSuccess: (r.failingStudents || []).length === 0,
            maxScore: outcomes.find(o => o.outcomeId === r.outcomeId)?.outcomeMax ?? 0
        }))
    }, [analysis, outcomes])

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200">
                    <p className="font-semibold text-slate-800">{label}</p>
                    <p className="text-sm">
                        Başarı: <span className="font-bold text-blue-600">%{payload[0].value.toFixed(1)}</span>
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Kazanım Analizi</h2>
                <p className="text-slate-500">Konu bazlı başarı ve telafi ihtiyaçları</p>
            </div>

            {/* Kazanım Grafiği */}
            <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-500" />
                        Kazanım Başarı Oranları
                    </CardTitle>
                    <CardDescription>Her kazanım için sınıf ortalama başarısı</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={outcomeStats.map((o, i) => ({
                                    name: `S${i + 1}`,
                                    fullTitle: o.title,
                                    başarı: o.successRate,
                                }))}
                                layout="vertical"
                                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={30} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <ReferenceLine x={masteryThreshold} stroke="#f59e0b" strokeDasharray="4 4" />
                                <Bar dataKey="başarı" radius={[0, 6, 6, 0]}>
                                    {outcomeStats.map((o, index) => (
                                        <Cell key={index} fill={o.successRate >= masteryThreshold ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Telafi Listesi (Failure Matrix) */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-500" />
                        Telafi Listesi
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">
                        Baraj: %{masteryThreshold}
                    </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {failureMatrix.map((rawItem, idx) => {
                        const item = rawItem || {}
                        const failedStudents = Array.isArray(item.failedStudents) ? item.failedStudents : []
                        const isAllSuccess = !!item.isAllSuccess
                        const failRate = typeof item.failRate === 'number' ? item.failRate : 0

                        return (
                            <div key={idx} className={`bg-white rounded-xl border p-4 transition-shadow hover:shadow-md ${isAllSuccess ? 'border-emerald-200' : 'border-red-100'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h4 className="font-semibold text-slate-800 truncate" title={item.outcome}>
                                            K{item.index + 1}: {item.outcome || 'Kazanım'}
                                        </h4>
                                        <p className="text-xs text-slate-400">Max: {item.maxScore}</p>
                                    </div>
                                    {isAllSuccess ? (
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> TAM
                                        </span>
                                    ) : (
                                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> {failedStudents.length}
                                        </span>
                                    )}
                                </div>

                                {/* Progress */}
                                {!isAllSuccess && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Başarısızlık</span>
                                            <span>%{failRate.toFixed(0)}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${failRate}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* Student List */}
                                {!isAllSuccess && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {failedStudents.length === 0 ? (
                                            <span className="text-xs text-slate-400 italic">Liste boş</span>
                                        ) : (
                                            failedStudents.map(student => {
                                                // Safe Access
                                                const name = student?.name ?? '-'
                                                const no = student?.no ?? student?.studentNumber ?? '?'
                                                const score = student?.score ?? 0
                                                const max = student?.maxScore ?? item.maxScore ?? 0

                                                // Name shortening
                                                const parts = name.trim().split(/\s+/)
                                                const shortName = parts.length > 1
                                                    ? `${parts[0]} ${parts[parts.length - 1][0]}.`
                                                    : parts[0]

                                                return (
                                                    <span
                                                        key={student.id || Math.random()}
                                                        className="inline-flex items-center gap-1 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 text-[11px] text-red-700"
                                                        title={`${no} - ${name} (${score}/${max})`}
                                                    >
                                                        <span className="font-mono font-bold text-red-800 opacity-70">{no}</span>
                                                        <span className="truncate max-w-[80px]">{shortName}</span>
                                                    </span>
                                                )
                                            })
                                        )}
                                    </div>
                                )}
                                {isAllSuccess && (
                                    <div className="text-center py-2 text-xs text-emerald-600 font-medium">
                                        Tüm sınıf başarılı 🎉
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
