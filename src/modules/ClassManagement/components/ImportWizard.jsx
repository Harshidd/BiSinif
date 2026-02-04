import React, { useState, useMemo } from 'react'
import { Upload, FileUp, AlertTriangle, CheckCircle, X, ArrowRight, Download, RefreshCw } from 'lucide-react'
import { parseCSV, generateTemplateCSV } from '../utils/csvParser'
import { classRepo } from '../repo/classRepo'

const STEPS = {
    UPLOAD: 'UPLOAD',
    MAP: 'MAP',
    PREVIEW: 'PREVIEW',
    RESULT: 'RESULT'
}

const FIELD_MAP = [
    { id: 'schoolNo', label: 'Okul No', required: true },
    { id: 'fullName', label: 'Ad Soyad', required: true },
    { id: 'gender', label: 'Cinsiyet (K/E)', required: false },
    { id: 'tags', label: 'Etiketler (Virgüllü)', required: false },
    { id: 'notes', label: 'Notlar', required: false }
]

export default function ImportWizard({ onClose, onFinish }) {
    const [step, setStep] = useState(STEPS.UPLOAD)
    const [file, setFile] = useState(null)
    const [parsedData, setParsedData] = useState([]) // [[col1, col2], ...]
    const [headers, setHeaders] = useState([])
    const [hasHeader, setHasHeader] = useState(true)

    // Mapping: { 'schoolNo': index, ... }
    const [columnMapping, setColumnMapping] = useState({})

    const [processing, setProcessing] = useState(false)
    const [results, setResults] = useState(null)

    const handleFile = async (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)

        try {
            const { data } = await parseCSV(f)
            // Filter empty rows
            const nonEmpty = data.filter(row => row.some(c => !!c))
            setParsedData(nonEmpty)

            // Auto-detect mapping if headers exist
            if (nonEmpty.length > 0) {
                const firstRow = nonEmpty[0]
                const initialMap = {}

                firstRow.forEach((col, idx) => {
                    const txt = col.toLowerCase()
                    if (txt.includes('no') || txt.includes('numara')) initialMap.schoolNo = idx
                    else if (txt.includes('ad') || txt.includes('isim')) initialMap.fullName = idx
                    else if (txt.includes('cins')) initialMap.gender = idx
                    else if (txt.includes('etiket') || txt.includes('tag')) initialMap.tags = idx
                    else if (txt.includes('not')) initialMap.notes = idx
                })
                setColumnMapping(initialMap)
                setHeaders(firstRow)
            }

            setStep(STEPS.MAP)
        } catch (err) {
            alert('Dosya okunamadı: ' + err.message)
        }
    }

    const downloadTemplate = () => {
        const content = generateTemplateCSV()
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ogrenci_listesi_sablon.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const previewData = useMemo(() => {
        const startIdx = hasHeader ? 1 : 0
        const rows = parsedData.slice(startIdx, startIdx + 5) // First 5 rows

        return rows.map((row, i) => {
            const obj = {}
            Object.entries(columnMapping).forEach(([field, colIdx]) => {
                if (colIdx !== undefined) obj[field] = row[colIdx]
            })
            // Validation preview
            let error = null
            if (!obj.schoolNo) error = 'No Eksik'
            else if (!obj.fullName) error = 'İsim Eksik'

            return { ...obj, _row: i + startIdx + 1, _error: error }
        })
    }, [parsedData, columnMapping, hasHeader])

    const runImport = async () => {
        if (!columnMapping.schoolNo || !columnMapping.fullName) {
            alert('Lütfen zorunlu alanları eşleştirin (Okul No ve Ad Soyad).')
            return
        }

        setProcessing(true)
        // Delay for UI update
        await new Promise(r => setTimeout(r, 100))

        const startIdx = hasHeader ? 1 : 0
        const dataRows = parsedData.slice(startIdx)

        let created = 0
        let updated = 0
        let skipped = 0
        let invalid = 0

        // Batch processing
        dataRows.forEach(row => {
            // Extract values
            const no = row[columnMapping.schoolNo]
            const name = row[columnMapping.fullName]

            if (!no || !name) {
                invalid++
                return
            }

            // Optional fields
            let gender = columnMapping.gender !== undefined ? row[columnMapping.gender] : ''
            let tagStr = columnMapping.tags !== undefined ? row[columnMapping.tags] : ''
            let note = columnMapping.notes !== undefined ? row[columnMapping.notes] : ''

            // Normalize
            gender = gender.trim().toUpperCase()
            if (['KIZ', 'KADIN', 'F', 'WOMAN'].includes(gender)) gender = 'K'
            if (['ERKEK', 'M', 'MAN'].includes(gender)) gender = 'E'
            if (!['K', 'E'].includes(gender)) gender = ''

            const tags = tagStr ? tagStr.split(/[,;]/).map(t => t.trim()).filter(Boolean) : []

            // Upsert
            const studentData = {
                schoolNo: no,
                fullName: name,
                gender: gender
            }

            // Check existence for stats (simplified, upsert handles logic but we want accurate counts)
            // classRepo.upsertRosterStudent logic handles merge/create. 
            // We can check if it returned a new ID or existing?
            // Actually classRepo doesn't return easy flag. Let's rely on repo.

            // We'll peek existence first to count correctly
            const exists = classRepo.listRoster().some(s =>
                s.schoolNo === String(no).trim() || s.fullName.toLowerCase() === name.toLowerCase().trim()
            )

            const saved = classRepo.upsertRosterStudent(studentData)

            // Profile updates
            if (tags.length > 0 || note) {
                classRepo.upsertProfile(saved.rosterId, { tags, notes: note })
            }

            if (exists) updated++
            else created++
        })

        setResults({ created, updated, invalid, total: dataRows.length })
        setStep(STEPS.RESULT)
        setProcessing(false)
        if (onFinish) onFinish()
    }

    // --- RENDERERS ---

    if (step === STEPS.UPLOAD) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileUp className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Öğrenci Listesi Yükle</h2>
                        <p className="text-gray-500 mt-2 text-sm">Csv formatındaki listenizi sürükleyin veya seçin.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                                <p className="text-sm text-gray-500 group-hover:text-blue-600"><span className="font-semibold">Dosya seçmek için tıklayın</span></p>
                                <p className="text-xs text-gray-400">.csv (UTF-8)</p>
                            </div>
                            <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
                        </label>

                        <button
                            onClick={downloadTemplate}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Örnek Şablonu İndir
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (step === STEPS.MAP) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold">Sütun Eşleştirme</h2>
                        <button onClick={onClose}><X className="text-gray-400" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Header Toggle */}
                        <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasHeader}
                                onChange={e => setHasHeader(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div>
                                <span className="font-bold text-gray-900 block">İlk satır başlık içeriyor</span>
                                <span className="text-xs text-gray-500">İşaretlenirse ilk satır import edilmez, başlık olarak kullanılır.</span>
                            </div>
                        </label>

                        {/* Mappers */}
                        <div className="grid gap-4">
                            {FIELD_MAP.map(field => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4 p-3 border rounded-xl bg-gray-50/50">
                                    <label className="font-semibold text-sm text-gray-700">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <select
                                        value={columnMapping[field.id] !== undefined ? columnMapping[field.id] : ''}
                                        onChange={(e) => setColumnMapping({ ...columnMapping, [field.id]: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        className={`w-full p-2.5 rounded-lg border text-sm ${field.required && columnMapping[field.id] === undefined ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                    >
                                        <option value="">-- Seç --</option>
                                        {headers.map((h, i) => (
                                            <option key={i} value={i}>
                                                Kolon {i + 1}: {h}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Preview */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Veri Önizleme (İlk 5)</h3>
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            {FIELD_MAP.map(f => <th key={f.id} className="p-2 border-r last:border-0">{f.label}</th>)}
                                            <th className="p-2">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className={row._error ? 'bg-red-50' : ''}>
                                                {FIELD_MAP.map(f => (
                                                    <td key={f.id} className="p-2 border-r last:border-0 text-gray-700">
                                                        {row[f.id] || <span className="text-gray-300 italic">-</span>}
                                                    </td>
                                                ))}
                                                <td className="p-2 font-medium">
                                                    {row._error ? <span className="text-red-600">{row._error}</span> : <span className="text-green-600">Uygun</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                        <button onClick={() => setStep(STEPS.UPLOAD)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">Geri</button>
                        <button
                            onClick={runImport}
                            disabled={processing}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2"
                        >
                            {processing ? <RefreshCw className="animate-spin w-4 h-4" /> : <FileUp className="w-4 h-4" />}
                            İçe Aktarımı Başlat
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (step === STEPS.RESULT && results) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">İşlem Tamamlandı</h2>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="text-2xl font-bold text-blue-700">{results.created}</div>
                            <div className="text-xs text-blue-500 font-semibold uppercase">Yeni</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="text-2xl font-bold text-purple-700">{results.updated}</div>
                            <div className="text-xs text-purple-500 font-semibold uppercase">Güncellendi</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                            <div className="text-2xl font-bold text-red-700">{results.invalid}</div>
                            <div className="text-xs text-red-500 font-semibold uppercase">Hatalı/Eksik</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-2xl font-bold text-gray-700">{results.total}</div>
                            <div className="text-xs text-gray-500 font-semibold uppercase">Toplam Satır</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Pencereyi Kapat
                    </button>
                </div>
            </div>
        )
    }

    return null
}
