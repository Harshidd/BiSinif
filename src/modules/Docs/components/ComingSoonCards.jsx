
import React from 'react'
import { Lock } from 'lucide-react'

const ComingSoonCards = ({ templates = [] }) => {
    if (!templates.length) return null

    return (
        <div className="space-y-3 animate-fade-in">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider ml-1">
                Yakında (v2)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4 cursor-default opacity-80"
                    >
                        <div>
                            <h5 className="text-gray-900 font-medium text-base mb-1">
                                {template.title.replace('(v2)', '').trim()}
                            </h5>
                            <p className="text-sm text-gray-500 line-clamp-1">
                                {template.description}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-600 uppercase tracking-wide">
                                v2
                            </span>
                            <Lock className="w-3 h-3 text-gray-400 mt-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ComingSoonCards
