import React from 'react'

export const ClassAnalysisSection = ({ analysis }) => {
    const students = analysis?.studentResults ?? []

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Sınıf Listesi</h2>
                <p className="text-slate-500">Tüm öğrencilerin başarı sıralaması</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 w-16">Sıra</th>
                                <th className="px-4 py-3 w-20">No</th>
                                <th className="px-4 py-3">Adı Soyadı</th>
                                <th className="px-4 py-3 text-center">Puan</th>
                                <th className="px-4 py-3 text-center">Başarı %</th>
                                <th className="px-4 py-3 text-center">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student, idx) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-400">
                                        {idx + 1}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-slate-600">
                                        {student.no || student.studentNumber || '-'}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                        {student.name}
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                                        {student.total.toFixed(0)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-600">
                                        {student.maxTotalScore > 0 ? `%${(student.total / student.maxTotalScore * 100).toFixed(0)}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {student.isPassing ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                Geçti
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                Kaldı
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
