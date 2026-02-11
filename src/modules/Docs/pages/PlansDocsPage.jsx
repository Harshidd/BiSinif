
import React from 'react'
import { Calendar } from 'lucide-react'
import TemplateButtonsGrid from '../components/TemplateButtonsGrid'
import ComingSoonCards from '../components/ComingSoonCards'
import { DOCUMENT_CATEGORIES, TEMPLATES } from '../templates/registry'

const PlansDocsPage = () => {
    const category = DOCUMENT_CATEGORIES.PLANS
    const activeTemplates = TEMPLATES.filter(t => t.category === category && t.status === 'active')
    const v2Templates = TEMPLATES.filter(t => t.category === category && t.status === 'v2')
    const hasV2 = v2Templates.length > 0

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-emerald-600" />
                        Planlama Şablonları
                    </h1>
                </div>
            </div>

            {/* Active Templates Grid */}
            <TemplateButtonsGrid
                templates={activeTemplates}
            />

            {/* Empty State / Info */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm flex gap-3">
                <div className="shrink-0">ℹ️</div>
                <p>
                    Yıllık ve günlük planlar için kapak sayfaları, şablonlar ve formatlar.
                </p>
            </div>

            {/* v2 Coming Soon Section */}
            {hasV2 && (
                <ComingSoonCards templates={v2Templates} />
            )}
        </div>
    )
}

export default PlansDocsPage
