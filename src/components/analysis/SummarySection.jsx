import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Users, CheckCircle2, XCircle, Target, TrendingUp } from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#93c5fd', '#86efac', '#fcd34d', '#fca5a5', '#c4b5fd', '#f9a8d4']

export const SummarySection = ({ analysis, config }) => {
    // Safe Access
    const meta = analysis?.meta ?? {}
    const studentCount = meta.studentCount ?? 0
    const passCount = meta.passCount ?? 0
    const failCount = meta.failCount ?? 0
    const classAverage = meta.classAverage ?? 0
    const maxTotalScore = meta.maxTotalScore ?? 100
    const passRate = meta.passRate ?? 0

    const scoreDistribution = (analysis?.scoreDistribution || []).map((entry, index) => ({
        ...entry,
        color: COLORS[index % COLORS.length]
    }))

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200">
                    <p className="font-semibold text-slate-800">{label}</p>
                    <p className="text-sm text-blue-600">
                        {payload[0].value} Öğrenci
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Sınav Özeti</h2>
                <p className="text-slate-500">Genel sınıf performansı ve başarı dağılımı</p>
            </div>

            {/* KPI Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Öğrenci</p>
                        <p className="text-xl font-bold text-slate-800">{studentCount}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Başarılı</p>
                        <p className="text-xl font-bold text-emerald-600">
                            {passCount} <span className="text-sm font-normal text-emerald-500">(%{passRate.toFixed(0)})</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Başarısız</p>
                        <p className="text-xl font-bold text-red-600">
                            {failCount} <span className="text-sm font-normal text-red-500">(%{(100 - passRate).toFixed(0)})</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Ortalama</p>
                        <p className="text-xl font-bold text-purple-600">
                            {classAverage.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ {maxTotalScore}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Histogram */}
            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Puan Dağılımı
                    </CardTitle>
                    <CardDescription>Puan aralıklarına göre öğrenci sayıları</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreDistribution} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {scoreDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
