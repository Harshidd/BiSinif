import React from 'react'
import {
    LayoutDashboard,
    Users,
    Target,
    BarChart3,
    GraduationCap
} from 'lucide-react'

export const AnalysisSidebar = ({ activeSection, onSectionChange }) => {
    const menuItems = [
        { id: 'ozet', label: 'Özet Durum', icon: LayoutDashboard },
        { id: 'sinif', label: 'Sınıf Analizi', icon: Users },
        { id: 'kazanim', label: 'Kazanım Analizi', icon: Target },
        { id: 'soru', label: 'Soru Analizi', icon: BarChart3 },
        { id: 'karne', label: 'Öğrenci Karnesi', icon: GraduationCap },
    ]

    return (
        <div className="flex flex-col gap-1 w-full">
            {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                    <button
                        key={item.id}
                        onClick={() => onSectionChange(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
              ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                    >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}
