
import React from 'react'
import { Link } from 'react-router-dom'
import {
    FileText,
    ShieldAlert,
    Users,
    CalendarDays,
    CheckSquare,
    ArrowRight
} from 'lucide-react'

const DocumentCategoryCard = ({ to, icon, title, description, colorClass, bgClass }) => {
    return (
        <Link
            to={to}
            className={`group flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all h-full hover:border-${colorClass}-200`}
        >
            <div className={`p-3 ${bgClass} rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(icon, { className: `w-6 h-6 text-${colorClass}-600` })}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
                {description}
            </p>
            <div className={`mt-auto flex items-center gap-2 text-${colorClass}-600 font-medium text-sm group-hover:gap-3 transition-all`}>
                İncele
                <ArrowRight className="w-4 h-4" />
            </div>
        </Link>
    )
}

const DocsHubPage = () => {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Evrak & Plan Üretici
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Sınıf verilerinden hızlı evrak üretimi, tutanak ve kontrol formları.
                    </p>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <DocumentCategoryCard
                    to="discipline"
                    icon={<ShieldAlert />}
                    title="Disiplin Tutanakları"
                    description="Öğrenci davranışları ve olay tutanakları için hazır şablonlar."
                    colorClass="red"
                    bgClass="bg-red-50"
                />

                <DocumentCategoryCard
                    to="committee"
                    icon={<Users />}
                    title="Zümre Tutanakları"
                    description="Sene başı, dönem sonu ve aylık zümre toplantı tutanakları."
                    colorClass="indigo"
                    bgClass="bg-indigo-50"
                />

                <DocumentCategoryCard
                    to="plans"
                    icon={<CalendarDays />}
                    title="Planlar"
                    description="Yıllık planlar, ders planları ve kulüp çalışma takvimleri."
                    colorClass="emerald"
                    bgClass="bg-emerald-50"
                />

                <DocumentCategoryCard
                    to="homework"
                    icon={<CheckSquare />}
                    title="Ödev Kontrol"
                    description="Ödev takip çizelgeleri ve proje değerlendirme ölçekleri."
                    colorClass="orange"
                    bgClass="bg-orange-50"
                />

            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-xl font-bold mb-2">Nasıl Çalışır?</h3>
                    <p className="text-slate-300 mb-6">
                        Sınıf listenizdeki öğrenci bilgilerini ve okul ayarlarınızı kullanarak otomatik evraklar oluşturun.
                        Şablon seçin, düzenleyin ve PDF/Word formatında indirin.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        BETA v0.1
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                    <FileText className="w-64 h-64" />
                </div>
            </div>
        </div>
    )
}

export default DocsHubPage
