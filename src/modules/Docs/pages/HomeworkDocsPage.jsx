
import React, { useState } from 'react'
import { ListChecks, UserCog } from 'lucide-react'
import TemplateButtonsGrid from '../components/TemplateButtonsGrid'
import ComingSoonCards from '../components/ComingSoonCards'
import StudentContextPanel from '../components/StudentContextPanel'
import { DOCUMENT_CATEGORIES, TEMPLATES } from '../templates/registry'

const HomeworkDocsPage = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [lessonName, setLessonName] = useState('')

    const handleConfirm = (data) => {
        setStudentName(data.studentName || '')
        setLessonName(data.lessonName || '')
    }

    const category = DOCUMENT_CATEGORIES.HOMEWORK
    const activeTemplates = TEMPLATES.filter(t => t.category === category && t.status === 'active')
    const v2Templates = TEMPLATES.filter(t => t.category === category && t.status === 'v2')
    const hasV2 = v2Templates.length > 0

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

                {/* Left: Icon & Title */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <ListChecks className="w-8 h-8 text-purple-600" />
                        Ödev & Kontrol Çizelgeleri
                    </h1>

                    {(studentName || lessonName) && (
                        <div className="text-sm text-gray-500 ml-11 flex flex-wrap gap-2 mt-2">
                            {studentName && (
                                <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                    Öğrenci: {studentName}
                                </span>
                            )}
                            {lessonName && (
                                <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                    Ders: {lessonName}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={() => setIsPanelOpen(true)}
                        className="flexItems-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl transition-all shadow-sm active:scale-95 text-sm font-medium flex items-center"
                    >
                        <UserCog className="w-4 h-4" />
                        Sınıf / Öğrenci Düzenle
                    </button>
                </div>
            </div>

            {/* Active Templates Grid */}
            <TemplateButtonsGrid
                templates={activeTemplates}
                prefilledInputs={{ studentName, lessonName }}
            />

            {/* Info Callout */}
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-purple-800 text-sm flex gap-3">
                <div className="shrink-0">ℹ️</div>
                <p>
                    Ödev takibi, proje teslim tutanakları ve sınıf içi kontrol formları.
                </p>
            </div>

            {/* v2 Coming Soon Section */}
            {hasV2 && (
                <ComingSoonCards templates={v2Templates} />
            )}

            <StudentContextPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onConfirm={handleConfirm}
                initialValues={{ studentName, lessonName }}
            />
        </div>
    )
}

export default HomeworkDocsPage
