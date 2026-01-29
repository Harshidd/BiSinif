import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart, Activity, User, BookOpen, Calendar, School } from 'lucide-react'

/* --- 3. YARDIMCILAR --- */
const safeNum = (x, fallback = 0) => {
    const n = Number(x)
    return Number.isFinite(n) ? n : fallback
}

const safeText = (x, fallback = '-') => (x ? String(x) : fallback)

const fmtDate = (d) => {
    if (!d) return '-'
    try {
        return new Date(d).toLocaleDateString('tr-TR')
    } catch (e) {
        return String(d)
    }
}

const pct = (x) => {
    const val = safeNum(x)
    return Math.max(0, Math.min(100, val)).toFixed(0)
}

const shortName = (full) => {
    if (!full) return '-'
    const parts = full.trim().split(/\s+/)
    if (parts.length < 2) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
}

const chunk = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    )
}

/* --- 4. A4 WRAPPER --- */
const A4Page = ({ children, className = '' }) => {
    return (
        <div
            className={`a4-page bg-white block overflow-hidden ${className}`}
            style={{
                width: '794px',
                minHeight: '1123px',
                height: '1123px',
                padding: '32px',
                boxSizing: 'border-box',
                position: 'relative'
            }}
        >
            {children}
        </div>
    )
}

/* --- 5. HEADER / FOOTER / UI --- */
const PrintHeader = ({ title = "NetAnaliz Raporu", subTitle }) => (
    <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2 mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subTitle && <p className="text-sm text-slate-500 font-medium mt-1">{subTitle}</p>}
        </div>
        <div className="text-right">
            <div className="flex items-center gap-2 justify-end text-slate-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wider">NETANALİZ</span>
            </div>
            <div className="text-[10px] text-slate-400">{new Date().toLocaleDateString('tr-TR')}</div>
        </div>
    </div>
)

const PrintFooter = ({ pageStr, schoolName }) => (
    <div className="mt-auto border-t border-slate-200 pt-2 flex justify-between items-center text-[10px] text-slate-400">
        <div className="flex items-center gap-1 font-medium">
            <School className="w-3 h-3" />
            {safeText(schoolName, 'Okul Bilgisi Yok')}
        </div>
        <div>{pageStr}</div>
    </div>
)

const RJXDivider = ({ label }) => (
    <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 border border-slate-200 rounded-full tracking-wider uppercase">
            {label}
        </span>
        <div className="h-px bg-slate-200 flex-1"></div>
    </div>
)

const StatCard = ({ label, value, sub, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        red: "bg-red-50 text-red-700 border-red-100",
        slate: "bg-slate-50 text-slate-700 border-slate-100"
    }
    const theme = colorClasses[color] || colorClasses.slate

    return (
        <div className={`p-4 rounded-xl border ${theme}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold opacity-70 uppercase tracking-wide">{label}</span>
                {Icon && <Icon className="w-4 h-4 opacity-50" />}
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
            {sub && <div className="text-xs opacity-70 font-medium">{sub}</div>}
        </div>
    )
}

/* --- 6. SAYFALAR --- */

// PAGE 1: KAPAK + ÖZET
const CoverPage = ({ analysis, config }) => {
    const summary = analysis?.summary || {}
    const passScore = safeNum(config?.generalPassingScore, 50)

    return (
        <A4Page>
            <div className="h-full flex flex-col">
                {/* Büyük Başlık */}
                <div className="text-center py-12 border-b border-slate-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6 shadow-lg shadow-blue-200">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Sınav Analiz Raporu</h1>
                    <p className="text-lg text-slate-500 font-medium tracking-tight">2025-2026 Eğitim Yılı – 1. Dönem</p>
                </div>

                {/* Meta Blok */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Sınıf</div>
                        <div className="font-bold text-slate-800">{safeText(config?.className)}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Ders</div>
                        <div className="font-bold text-slate-800">{safeText(config?.courseName)}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Öğretmen</div>
                        <div className="font-bold text-slate-800">{safeText(config?.teacherName)}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Tarih</div>
                        <div className="font-bold text-slate-800">{fmtDate(config?.examDate)}</div>
                    </div>
                </div>

                <RJXDivider label="ÖZET DURUM" />

                {/* Özet Kartları */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <StatCard
                        label="Katılım"
                        value={safeNum(summary.studentCount)}
                        sub="Öğrenci Sınava Girdi"
                        icon={User}
                        color="slate"
                    />
                    <StatCard
                        label="Sınıf Ortalaması"
                        value={safeNum(summary.averageScore).toFixed(1)}
                        sub={`Max: ${safeNum(summary.maxPossibleScore, 100)}`}
                        icon={BarChart3}
                        color="blue"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            label="Başarılı"
                            value={safeNum(summary.passedCount)}
                            sub={`%${safeNum(summary.successRate).toFixed(0)}`}
                            icon={CheckCircle}
                            color="green"
                        />
                        <StatCard
                            label="Başarısız"
                            value={safeNum(summary.failedCount)}
                            sub={`%${safeNum(summary.failRate).toFixed(0)}`}
                            icon={XCircle}
                            color="red"
                        />
                    </div>
                    <StatCard
                        label="Geçme Puanı"
                        value={passScore}
                        sub="Baraj Puanı"
                        icon={AlertTriangle}
                        color="slate"
                    />
                </div>

                <div className="mt-auto">
                    <PrintFooter pageStr="Sayfa 1" schoolName={config?.schoolName} />
                </div>
            </div>
        </A4Page>
    )
}

// PAGE 2: SINIF ANALİZİ
const ClassPage = ({ analysis, config }) => {
    const summary = analysis?.summary || {}
    const distribution = analysis?.gradeDistribution || []

    // Mock Chart Bars
    const maxCount = Math.max(...distribution.map(d => d.count), 1)

    // Slice Students List for preview
    const studentsAll = analysis?.studentResults || []
    const studentsPreview = studentsAll.slice(0, 15)

    return (
        <A4Page>
            <PrintHeader title="Sınıf Analizi" subTitle="Genel Başarı Dağılımı ve İstatistikler" />

            <div className="grid grid-cols-2 gap-8 h-[240px] mb-8">
                {/* Left: Chart Placeholder */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        Başarı Dağılımı
                    </h3>
                    <div className="flex-1 flex items-end justify-between gap-2 px-2">
                        {distribution.map((d, i) => {
                            const barH = (d.count / maxCount) * 100
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                                    <div className="text-[10px] font-bold text-slate-600 mb-1">{d.count}</div>
                                    <div
                                        className="w-full bg-blue-500 rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                                        style={{ height: `${Math.max(barH, 4)}%` }}
                                    />
                                    <div className="text-[9px] text-slate-400 rotate-0 truncate w-full text-center">{d.range}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right: Stats Table */}
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Temel İstatistikler</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-slate-100"><td className="py-2 text-slate-500">Ortalama</td><td className="py-2 text-right font-bold">{safeNum(summary.averageScore).toFixed(1)}</td></tr>
                            <tr className="border-b border-slate-100"><td className="py-2 text-slate-500">Medyan</td><td className="py-2 text-right font-bold">{safeNum(summary.medianScore, '-')}</td></tr>
                            <tr className="border-b border-slate-100"><td className="py-2 text-slate-500">En Yüksek Puan</td><td className="py-2 text-right font-bold text-emerald-600">{safeNum(summary.highestScore)}</td></tr>
                            <tr className="border-b border-slate-100"><td className="py-2 text-slate-500">En Düşük Puan</td><td className="py-2 text-right font-bold text-red-600">{safeNum(summary.lowestScore)}</td></tr>
                            <tr className="border-b border-slate-100"><td className="py-2 text-slate-500">Standart Sapma</td><td className="py-2 text-right font-bold">{safeNum(summary.stdDev).toFixed(1)}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <RJXDivider label="ÖĞRENCİ SONUÇLARI (ÖZET)" />

            {/* Student List Preview */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 w-16">Sıra</th>
                            <th className="px-4 py-2 w-24">No</th>
                            <th className="px-4 py-2">Ad Soyad</th>
                            <th className="px-4 py-2 text-right">Puan</th>
                            <th className="px-4 py-2 text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {studentsPreview.map((s, i) => (
                            <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="px-4 py-2 text-slate-400 font-mono">{s.rank ?? i + 1}</td>
                                <td className="px-4 py-2 font-medium">{safeText(s.no || s.studentNumber)}</td>
                                <td className="px-4 py-2 text-slate-900">{s.name}</td>
                                <td className="px-4 py-2 text-right font-bold">{safeNum(s.total).toFixed(0)}</td>
                                <td className="px-4 py-2 text-right">
                                    {s.isPassing ?
                                        <span className="text-emerald-600 font-bold">Geçti</span> :
                                        <span className="text-red-500 font-bold">Kaldı</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {studentsAll.length > 15 && (
                    <div className="bg-slate-50 p-2 text-center text-[10px] text-slate-500 italic border-t border-slate-200">
                        ... ve {studentsAll.length - 15} öğrenci daha. Tam liste için Excel raporunu kullanınız.
                    </div>
                )}
            </div>

            <PrintFooter pageStr="Sayfa 2" schoolName={config?.schoolName} />
        </A4Page>
    )
}

// PAGE 3: KAZANIM ANALİZİ
const OutcomesPage = ({ analysis, config }) => {
    const outcomes = analysis?.outcomes || []
    const titles = config?.outcomes || []

    return (
        <A4Page>
            <PrintHeader title="Kazanım Analizi" subTitle="Konu Bazlı Başarı ve Telafi İhtiyaçları" />

            {/* Bar Chart Hack */}
            <div className="mb-8">
                <div className="h-[200px] border-l border-b border-slate-300 relative mt-4">
                    <div className="absolute inset-0 flex items-end justify-around px-2 pb-px">
                        {outcomes.map((o, i) => (
                            <div key={i} className="flex-1 mx-1 flex flex-col justify-end group h-full">
                                <div className="relative w-full bg-slate-200 rounded-t-sm" style={{ height: `${o.successRate}%` }}>
                                    <div className={`absolute bottom-0 left-0 right-0 top-0 opacity-80 ${o.successRate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">
                                        %{o.successRate.toFixed(0)}
                                    </div>
                                </div>
                                <div className="text-[9px] text-slate-400 text-center mt-1 font-mono">K{i + 1}</div>
                            </div>
                        ))}
                    </div>
                    {/* Grid lines */}
                    {[25, 50, 75, 100].map(y => (
                        <div key={y} className="absolute w-full border-t border-slate-100 border-dashed text-[9px] text-slate-300" style={{ bottom: `${y}%` }}>
                            <span className="-ml-6">{y}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <RJXDivider label="KAZANIM BAZLI TELAFİ LİSTESİ" />

            <div className="space-y-6">
                {outcomes.map((o, i) => {
                    const title = titles[i] || `Kazanım ${i + 1}`
                    const failedStudents = o.failedStudents || [] // Assuming analysis has this

                    return (
                        <div key={i} className="border border-slate-200 rounded-lg p-3 break-inside-avoid">
                            <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded textxs font-mono">K{i + 1}</span>
                                        {title}
                                    </h4>
                                </div>
                                <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                    Telafi: {failedStudents.length} öğrenci
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {failedStudents.length === 0 ? (
                                    <span className="text-[10px] text-emerald-600 font-medium italic">Tam başarı, telafi gerekmiyor.</span>
                                ) : (
                                    failedStudents.map((s, si) => (
                                        <div key={si} className="inline-flex items-center text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                            <span className="font-mono font-bold mr-1">{safeText(s.no || s.studentNumber)}</span>
                                            <span>{shortName(s.name)}</span>
                                            {s.score !== undefined && <span className="ml-1 text-red-400">({safeNum(s.score).toFixed(0)})</span>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
                {outcomes.length === 0 && <div className="text-center text-slate-400 italic py-8">Kazanım verisi bulunamadı.</div>}
            </div>

            <PrintFooter pageStr="Sayfa 3" schoolName={config?.schoolName} />
        </A4Page>
    )
}

// PAGE 4: SORU ANALİZİ
const QuestionsPage = ({ analysis, config }) => {
    // If analysis.questions is missing, try to derive basic count
    // But ideally analysis object should have 'itemAnalysis' or raw 'questions'
    const questions = analysis?.questions || [] // assuming derived stats are here or raw questions
    const itemStats = analysis?.itemStats || [] // If calculated

    return (
        <A4Page>
            <PrintHeader title="Soru Analizi" subTitle="Madde Güçlük ve Ayırt Edicilik (Basitleştirilmiş)" />

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <table className="w-full text-xs text-left border border-slate-200">
                        <thead className="bg-slate-50 font-bold text-slate-600">
                            <tr>
                                <th className="px-3 py-2 border-b">Soru</th>
                                <th className="px-3 py-2 border-b">Kazanım</th>
                                <th className="px-3 py-2 border-b text-center">Max Puan</th>
                                <th className="px-3 py-2 border-b text-center">Zorluk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {questions.map((q, i) => {
                                const outcomeId = safeNum(q.outcomeId, -1)
                                const outcomeTitle = config?.outcomes?.[outcomeId] || '-'
                                const difficulty = itemStats[i]?.difficulty || 0 // 0-1 range usually
                                const diffPct = difficulty * 100

                                return (
                                    <tr key={i}>
                                        <td className="px-3 py-2 font-mono font-bold text-slate-500">S{q.qNo}</td>
                                        <td className="px-3 py-2 truncate max-w-[150px]" title={outcomeTitle}>K{outcomeId + 1}</td>
                                        <td className="px-3 py-2 text-center font-medium">{q.maxScore}</td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${diffPct > 80 ? 'bg-emerald-400' : diffPct < 40 ? 'bg-red-400' : 'bg-blue-400'}`}
                                                        style={{ width: `${diffPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] text-slate-400">%{diffPct.toFixed(0)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {questions.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-400">Soru verisi yok</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl h-full flex flex-col justify-center items-center text-center text-slate-400">
                        <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-xs">Soru Zorluk Grafiği</p>
                        <p className="text-[10px] opacity-60">(Placeholder)</p>
                    </div>
                </div>
            </div>

            <PrintFooter pageStr="Sayfa 4" schoolName={config?.schoolName} />
        </A4Page>
    )
}

// STUDENT PAGE
const StudentReportPage = ({ student, analysis, config, pageIndex }) => {
    // Calc outcome comparisons
    const comparisonData = (config?.outcomes || []).map((title, i) => {
        const studentScore = student.outcomeScores?.[i] || 0
        const maxScore = analysis?.outcomes?.[i]?.maxScore || 10
        const classAvg = analysis?.outcomes?.[i]?.avgScore || 0
        return {
            title,
            studentPct: (studentScore / maxScore) * 100,
            classPct: (classAvg / maxScore) * 100
        }
    })

    // Strong/Weak
    const sortedOutcomes = [...comparisonData].map((d, i) => ({ ...d, idx: i }))
        .sort((a, b) => b.studentPct - a.studentPct)

    const strong = sortedOutcomes.filter(o => o.studentPct >= (config?.outcomeMasteryThreshold || 50)).slice(0, 5)
    const weak = sortedOutcomes.filter(o => o.studentPct < (config?.outcomeMasteryThreshold || 50)).reverse().slice(0, 5)

    return (
        <A4Page>
            <PrintHeader title="Öğrenci Karnesi" />

            {/* Banner */}
            <div className={`p-6 rounded-xl border flex items-center justify-between mb-8 ${student.isPassing ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-white/50 shadow-sm">
                        <User className={`w-6 h-6 ${student.isPassing ? 'text-emerald-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{safeText(student.name, 'İsimsiz')}</div>
                        <div className="text-sm opacity-70 font-medium font-mono">No: {safeText(student.no || student.studentNumber)}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-black ${student.isPassing ? 'text-emerald-700' : 'text-red-700'}`}>
                        {safeNum(student.total).toFixed(0)}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${student.isPassing ? 'text-emerald-600' : 'text-red-600'}`}>
                        {student.isPassing ? 'GEÇTİ' : (student.total >= 40 ? 'SORUMLU GEÇTİ' : 'KALDI')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
                {/* Sol: Stats */}
                <div className="space-y-4">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-400">Sınıf Sıralaması</div>
                        <div className="flex items-baseline gap-1">
                            <div className="text-xl font-bold text-slate-700">{student.rank ?? '-'}</div>
                            <div className="text-xs text-slate-400">/ {analysis?.studentResults?.length ?? '-'}</div>
                        </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="text-xs text-slate-400">Sınıf Ortalaması Farkı</div>
                        <div className="flex items-baseline gap-1">
                            <div className={`text-xl font-bold ${safeNum(student.total) >= safeNum(analysis?.summary?.averageScore) ? 'text-emerald-600' : 'text-red-600'}`}>
                                {(safeNum(student.total) - safeNum(analysis?.summary?.averageScore)).toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ: Chart Placeholder */}
                <div className="col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50/30">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Kazanım Karşılaştırması</h4>
                    <div className="h-[120px] flex items-end justify-between gap-1">
                        {comparisonData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-1 group relative">
                                {/* Student Bar */}
                                <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${Math.max(d.studentPct, 4)}%` }}></div>
                                <div className="text-[8px] text-center text-slate-400">K{i + 1}</div>
                                {/* Tooltip-ish (printte çıkmaz ama olsun) */}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-[9px] text-slate-500">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500"></div>Öğrenci</div>
                        {/* Class avg bar is hard to visualize simply here without overlap, skipping for clarity */}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Güçlü Kazanımlar
                    </h4>
                    <ul className="space-y-1">
                        {strong.map((s, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                                <span className="font-mono text-emerald-600">%{s.studentPct.toFixed(0)}</span>
                                <span className="truncate">{safeText(s.title)}</span>
                            </li>
                        ))}
                        {strong.length === 0 && <li className="text-xs text-slate-400 italic">Veri yetersiz or tümü düşük.</li>}
                    </ul>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Geliştirilmeli
                    </h4>
                    <ul className="space-y-1">
                        {weak.map((s, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                                <span className="font-mono text-amber-600">%{s.studentPct.toFixed(0)}</span>
                                <span className="truncate">{safeText(s.title)}</span>
                            </li>
                        ))}
                        {weak.length === 0 && <li className="text-xs text-slate-400 italic">Harika! Zayıf konu yok.</li>}
                    </ul>
                </div>
            </div>

            <RJXDivider label="ÖĞRETMEN GÖRÜŞÜ" />
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 italic">
                {student.isPassing
                    ? `Sayın ${safeText(student.name)}, genel performansınız başarılı düzeydedir. Başarılarınızın devamını dilerim.`
                    : `Sayın ${safeText(student.name)}, bu sınavda beklenen başarıyı gösteremediniz. Eksik kazanımlarınızı tekrar etmeniz önerilir.`
                }
            </div>

            <PrintFooter pageStr={`Öğrenci K. ${pageIndex + 1}`} schoolName={config?.schoolName} />
        </A4Page>
    )
}

/* --- MAIN EXPORT --- */
export default function ReportPrintView({ analysis, config, students, questions }) {
    // Fallback / Data prep
    // students & questions prop olarak gelmezse analysis içinden almayı dene
    const safeStudents = students ?? analysis?.studentResults ?? []
    const safeQuestions = questions ?? analysis?.questions ?? [] // if available
    const safeConfig = config ?? {}
    const safeAnalysis = analysis ?? { summary: {}, outcomes: [] }

    return (
        <div className="print-root bg-slate-100 p-8 min-h-screen">
            {/* 
         Bu wrapper ekran için "preview" modundadır. 
         PDF export sırasında bu div içindeki .a4-page'ler capture edilir.
      */}
            <style>{`
         @media print {
            .print-root { background: white; padding: 0; }
            .a4-page { margin: 0; box-shadow: none; page-break-after: always; }
         }
      `}</style>

            {/* 1. Kapak */}
            <CoverPage analysis={safeAnalysis} config={safeConfig} />

            {/* 2. Sınıf */}
            <ClassPage analysis={safeAnalysis} config={safeConfig} />

            {/* 3. Kazanım */}
            <OutcomesPage analysis={safeAnalysis} config={safeConfig} />

            {/* 4. Soru */}
            <QuestionsPage analysis={{ ...safeAnalysis, questions: safeQuestions }} config={safeConfig} />

            {/* 5. Öğrenciler Loop */}
            {safeStudents.length > 0 ? safeStudents.map((s, i) => (
                <StudentReportPage
                    key={s.id || i}
                    student={s}
                    analysis={safeAnalysis}
                    config={safeConfig}
                    pageIndex={i}
                />
            )) : (
                <A4Page>
                    <PrintHeader title="Öğrenci Raporu" />
                    <div className="text-center py-20 text-slate-400">Öğrenci verisi bulunamadı.</div>
                </A4Page>
            )}
        </div>
    )
}
