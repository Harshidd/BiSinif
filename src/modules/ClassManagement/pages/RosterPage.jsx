import React, { useState, useEffect, useMemo, memo } from 'react'
import { classRepo } from '../repo/classRepo'
import StudentImporter from '../../../components/StudentImporter'
import StudentEditorModal from '../components/StudentEditorModal'
import ImportWizard from '../components/ImportWizard'
import { Trash2, Edit2, Search, UserPlus, Filter, ArrowUpDown, X, MoreHorizontal, FileText } from 'lucide-react'

// Memoized Item for Performance
const StudentItem = memo(({ student, onEdit, onDelete }) => {
    return (
        <div className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all hover:border-blue-200">
            <div className="flex items-center gap-4">
                {/* Avatar / Number */}
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${student.gender === 'K' ? 'bg-pink-50 text-pink-600' :
                        student.gender === 'E' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}
                `}>
                    {student.schoolNo || '?'}
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{student.fullName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 font-medium tracking-wide">
                            {student.studentNumber ? `#${student.studentNumber}` : 'NO YOK'}
                        </span>
                        {/* Tags Badges */}
                        {student._profile?.tags?.slice(0, 3).map(t => (
                            <span key={t} className="w-2 h-2 rounded-full bg-blue-400" title={t} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(student.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(student.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
})

export default function RosterPage() {
    const [students, setStudents] = useState([])
    const [search, setSearch] = useState('')

    // Filters & Sort
    const [filterGender, setFilterGender] = useState('ALL') // ALL, K, E
    const [sortBy, setSortBy] = useState('NO_ASC') // NO_ASC, NAME_ASC

    // Editor State
    const [isEditorOpen, setEditorOpen] = useState(false)
    const [isImportWizardOpen, setImportWizardOpen] = useState(false)
    const [editTargetId, setEditTargetId] = useState(null)
    const [showImporter, setShowImporter] = useState(false)

    useEffect(() => {
        refresh()
    }, [])

    const refresh = () => {
        // Need to use getStudents to get Profile data (tags, gender correct merge)
        setStudents(classRepo.getStudents())
    }

    const filtered = useMemo(() => {
        let result = students
        const term = search.toLowerCase().trim()

        // 1. Search
        if (term) {
            result = result.filter(s =>
                (s.name || '').toLowerCase().includes(term) ||
                (s.no || '').includes(term)
            )
        }

        // 2. Filter
        if (filterGender !== 'ALL') {
            if (s.gender === filterGender) return true
        }

        // 3. Sort
        result = [...result].sort((a, b) => {
            if (sortBy === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '')
            if (sortBy === 'NO_ASC') {
                // Try numeric sort
                const nA = parseInt(a.no, 10)
                const nB = parseInt(b.no, 10)
                if (!isNaN(nA) && !isNaN(nB)) return nA - nB
                return (a.no || '').localeCompare(b.no || '')
            }
            return 0
        })

        if (filterGender !== 'ALL') {
            return result.filter(s => s.gender === filterGender)
        }

        return result
    }, [students, search, filterGender, sortBy])

    const handleDelete = (id) => {
        if (window.confirm('Bu öğrenciyi ve ilişkili tüm verilerini (kısıtlamalar, geçmiş) silmek istediğinize emin misiniz?')) {
            classRepo.deleteStudentCascade(id)
            refresh()
        }
    }

    const openCreate = () => {
        setEditTargetId(null)
        setEditorOpen(true)
    }

    const openEdit = (id) => {
        setEditTargetId(id)
        setEditorOpen(true)
    }

    const handleSave = () => {
        refresh()
    }

    return (
        <div className="pb-20 space-y-6 animate-fade-in relative min-h-[600px]">

            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Öğrenci Yönetimi</h1>
                    <p className="text-xs text-gray-500">Sınıf listesini düzenle, yeni kayıt ekle veya toplu yükle.</p>
                </div>
                <div className="flex gap-2">
                    {/* CSV Import Trigger */}
                    <button
                        onClick={() => setImportWizardOpen(true)}
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4 text-green-600" />
                        CSV İçe Aktar
                    </button>

                    <button
                        onClick={() => setShowImporter(!showImporter)}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${showImporter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {showImporter ? 'E-Okul Sihirbazı' : 'E-Okul / Excel'}
                    </button>
                    <button
                        onClick={openCreate}
                        className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center gap-2 text-sm shadow-lg shadow-gray-200"
                    >
                        <UserPlus className="w-4 h-4" />
                        Yeni Öğrenci
                    </button>
                </div>
            </div>

            {/* Importer Panel */}
            {showImporter && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 animate-fade-in">
                    <StudentImporter target="roster" onImport={() => { refresh(); setShowImporter(false) }} />
                </div>
            )}

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="İsim veya numara ile ara..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 hover:border-gray-300 transition-colors shadow-sm"
                    />
                </div>

                <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                    {['ALL', 'K', 'E'].map(g => (
                        <button
                            key={g}
                            onClick={() => setFilterGender(g)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filterGender === g ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {g === 'ALL' ? 'Tümü' : g === 'K' ? 'Kız' : 'Erkek'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setSortBy(prev => prev === 'NO_ASC' ? 'NAME_ASC' : 'NO_ASC')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortBy === 'NO_ASC' ? 'Numaraya Göre' : 'İsme Göre'}
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(s => (
                    <StudentItem
                        key={s.id}
                        student={s}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Kriterlere uygun sonuç bulunamadı.</p>
                </div>
            )}

            {/* Floating Stats */}
            <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-full shadow-xl text-xs font-bold z-10">
                {filtered.length} / {students.length} Öğrenci
            </div>

            {/* Modal */}
            <StudentEditorModal
                isOpen={isEditorOpen}
                onClose={() => setEditorOpen(false)}
                studentId={editTargetId}
                onSave={handleSave}
            />

            {/* CSV Import Wizard */}
            {isImportWizardOpen && (
                <ImportWizard
                    onClose={() => setImportWizardOpen(false)}
                    onFinish={() => { refresh(); }}
                />
            )}
        </div>
    )
}
