import React, { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Alert, AlertDescription } from './ui/Alert'
import { Upload, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import * as XLSX from 'xlsx'

/**
 * e-Okul Friendly Student Importer
 * Supports: Excel upload, paste from e-Okul, manual entry
 * Can render as left panel (default) or compact toolbar (compact=true)
 */

const ExcelUploader = ({ onStudentsImported, existingStudents, compact = false }) => {
  const [mode, setMode] = useState('excel') // 'excel' | 'paste' | 'manual'
  const [students, setStudents] = useState(existingStudents || [])
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [hasHeader, setHasHeader] = useState(true)

  // Normalize Turkish characters
  const normalizeTurkish = (str) => {
    if (!str) return ''
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
  }

  // Clean value
  const cleanValue = (val) => {
    if (val === null || val === undefined) return ''
    return String(val).trim().replace(/\s+/g, ' ')
  }

  // Detect column type
  const detectColumnType = (headerText) => {
    const normalized = normalizeTurkish(headerText)

    if (
      normalized.includes('okul no') ||
      normalized.includes('ogrenci no') ||
      normalized.includes('ogr no') ||
      normalized === 'no' ||
      normalized === 'numara'
    ) {
      return 'STUDENT_NUMBER'
    }

    if (
      normalized.includes('ad soyad') ||
      normalized.includes('adi soyadi') ||
      normalized.includes('ad-soyad') ||
      normalized.includes('ogrenci') && !normalized.includes('no') ||
      normalized.includes('isim') ||
      normalized === 'ad'
    ) {
      return 'NAME'
    }

    if (normalized.includes('sira')) {
      return 'ORDER'
    }

    return null
  }

  // Generate stable ID
  const generateId = (studentNumber, name, index) => {
    if (studentNumber) {
      return `student-${studentNumber}-${Date.now()}`
    }
    return `student-${index}-${Date.now()}`
  }

  // Parse table data
  const parseTableData = (rows, autoDetectHeader = true) => {
    if (!rows || rows.length === 0) {
      return { error: 'Veri bulunamadı.' }
    }

    let headerRowIndex = -1
    let studentNumberCol = -1
    let nameCol = -1

    // Find header row
    if (autoDetectHeader) {
      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i]
        if (!row || row.length < 1) continue

        let foundHeaders = 0

        for (let j = 0; j < row.length; j++) {
          const cellValue = row[j]
          if (!cellValue) continue

          const columnType = detectColumnType(cellValue)

          if (columnType === 'STUDENT_NUMBER' && studentNumberCol === -1) {
            studentNumberCol = j
            foundHeaders++
          } else if (columnType === 'NAME' && nameCol === -1) {
            nameCol = j
            foundHeaders++
          }
        }

        if (foundHeaders >= 1 && nameCol !== -1) {
          headerRowIndex = i
          break
        }
      }
    } else {
      headerRowIndex = -1
      if (rows.length > 0) {
        const firstRow = rows[0]
        if (firstRow.length >= 2) {
          studentNumberCol = 0
          nameCol = 1
        } else if (firstRow.length === 1) {
          nameCol = 0
        }
      }
    }

    if (nameCol === -1) {
      return {
        error: 'İsim sütunu bulunamadı.\n\nLütfen en az "AD SOYAD" sütunu olduğundan emin olun.'
      }
    }

    // Parse students
    const parsedStudents = []
    const startRow = headerRowIndex + 1
    const seenNames = new Set()

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const rawName = row[nameCol]
      const studentName = cleanValue(rawName)
      if (!studentName) continue

      if (seenNames.has(studentName.toLowerCase())) continue
      seenNames.add(studentName.toLowerCase())

      const rawNumber = studentNumberCol !== -1 ? row[studentNumberCol] : null
      const studentNumber = cleanValue(rawNumber)

      const siraNo = parsedStudents.length + 1

      parsedStudents.push({
        id: generateId(studentNumber, studentName, i),
        siraNo: String(siraNo),
        studentNumber: studentNumber || null,
        no: studentNumber || null,
        name: studentName,
      })
    }

    if (parsedStudents.length === 0) {
      return { error: 'Öğrenci verisi bulunamadı.' }
    }

    const hasNumbers = parsedStudents.some(s => s.studentNumber)
    const warning = !hasNumbers
      ? `⚠️ UYARI: Okul numarası bulunamadı.\n\n${parsedStudents.length} öğrenci yüklendi.`
      : null

    return { students: parsedStudents, warning }
  }

  // Parse Excel file
  const parseExcelFile = useCallback((file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        const result = parseTableData(jsonData, true)
        if (result.error) {
          setError(result.error)
          return
        }

        setStudents(result.students)
        onStudentsImported(result.students)
        setFileName(file.name)
        setError(result.warning || null)
      } catch (err) {
        setError('Excel dosyası okunurken hata: ' + err.message)
      }
    }

    reader.onerror = () => {
      setError('Dosya okuma hatası.')
    }

    reader.readAsArrayBuffer(file)
  }, [onStudentsImported])

  // Handle paste
  const handlePaste = () => {
    if (!pasteText.trim()) {
      setError('Lütfen e-Okul listesini yapıştırın.')
      return
    }

    try {
      const lines = pasteText.trim().split('\n')
      const rows = lines.map(line => {
        if (line.includes('\t')) {
          return line.split('\t').map(cell => cell.trim())
        }
        return line.split(/\s{2,}/).map(cell => cell.trim())
      })

      const result = parseTableData(rows, hasHeader)
      if (result.error) {
        setError(result.error)
        return
      }

      setStudents(result.students)
      onStudentsImported(result.students)
      setError(result.warning || null)
      setPasteText('')
    } catch (err) {
      setError('Yapıştırılan veri işlenirken hata: ' + err.message)
    }
  }

  // Add manual student
  const handleAddManual = () => {
    const newStudent = {
      id: `student-manual-${Date.now()}`,
      siraNo: String(students.length + 1),
      studentNumber: '',
      no: '',
      name: 'Yeni Öğrenci',
    }
    const updated = [...students, newStudent]
    setStudents(updated)
    onStudentsImported(updated)
  }

  // File input handler
  const handleFileInput = useCallback((e) => {
    const files = e.target.files
    if (files.length > 0) {
      parseExcelFile(files[0])
    }
  }, [parseExcelFile])

  // Compact toolbar mode
  if (compact) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 h-full">
        <div className="space-y-4">
          {/* Header with mode tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Öğrenci Alma:</span>
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg">
                <button
                  onClick={() => setMode('excel')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'excel'
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Excel
                </button>
                <button
                  onClick={() => setMode('paste')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'paste'
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Yapıştır
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'manual'
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Manuel
                </button>
              </div>
            </div>

            {/* Success badge */}
            {students.length > 0 && !error && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {students.length} öğrenci yüklendi
                </span>
              </div>
            )}
          </div>

          {/* Mode content */}
          <div>
            {mode === 'excel' && (
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="file-upload-compact"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="file-upload-compact"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors shadow-sm active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Dosya Seç
                </label>
                <span className="text-sm text-gray-500">.xlsx veya .xls dosyası</span>
              </div>
            )}

            {mode === 'paste' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      className="rounded"
                    />
                    İlk satır başlık
                  </label>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="e-Okul listesini buraya yapıştırın..."
                    className="flex-1 h-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                  />
                  <Button onClick={handlePaste} size="sm" className="self-end">
                    İşle
                  </Button>
                </div>
              </div>
            )}

            {mode === 'manual' && (
              <div className="flex items-center gap-3">
                <Button onClick={handleAddManual} variant="outline" size="sm">
                  Yeni Öğrenci Ekle
                </Button>
                <span className="text-xs text-gray-500">Tabloda düzenleyebilirsiniz</span>
              </div>
            )}
          </div>

          {/* Error/Warning */}
          {error && (
            <Alert
              variant={error.includes('UYARI') ? 'default' : 'destructive'}
              className={`${error.includes('UYARI') ? 'bg-amber-50 border-amber-300' : ''}`}
            >
              <AlertCircle className={`h-3.5 w-3.5 ${error.includes('UYARI') ? 'text-amber-600' : ''}`} />
              <AlertDescription className={`text-xs ${error.includes('UYARI') ? 'text-amber-800' : ''}`}>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  // Default card mode (left panel)
  return (
    <Card className="shadow-apple-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Öğrenci Alma</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mode Selector */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMode('excel')}
            className={`px-2.5 py-1.5 text-xs rounded-lg transition-all text-left ${mode === 'excel'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            e-Okul Excel Yükle
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-2.5 py-1.5 text-xs rounded-lg transition-all text-left ${mode === 'paste'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Kopyala-Yapıştır
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-2.5 py-1.5 text-xs rounded-lg transition-all text-left ${mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Manuel Ekle
          </button>
        </div>

        {/* Excel Upload Mode */}
        {mode === 'excel' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-all">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-gray-800">Dosya Seç</p>
                  <p className="text-[10px] text-gray-500">.xlsx veya .xls</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Paste Mode */}
        {mode === 'paste' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded"
              />
              İlk satır başlık
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="e-Okul listesini buraya yapıştırın..."
              className="w-full h-24 px-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <Button onClick={handlePaste} size="sm" className="w-full">
              İşle
            </Button>
          </div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-600">
              Boş öğrenci ekleyin, sağ panelde düzenleyin.
            </p>
            <Button onClick={handleAddManual} variant="outline" size="sm" className="w-full">
              Yeni Öğrenci Ekle
            </Button>
          </div>
        )}

        {/* Error/Warning */}
        {error && (
          <Alert variant={error.includes('UYARI') ? 'default' : 'destructive'}
            className={error.includes('UYARI') ? 'bg-amber-50 border-amber-300' : ''}>
            <AlertCircle className={`h-4 w-4 ${error.includes('UYARI') ? 'text-amber-600' : ''}`} />
            <AlertDescription className={`text-xs whitespace-pre-line ${error.includes('UYARI') ? 'text-amber-800' : ''}`}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {students.length > 0 && !error && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-xs text-green-700">
              ✅ <strong>{students.length} öğrenci</strong> yüklendi
              {fileName && ` (${fileName})`}
            </AlertDescription>
          </Alert>
        )}

        {/* Tips */}
        <div className="pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 w-full"
          >
            {showTips ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            İpuçları
          </button>
          {showTips && (
            <div className="mt-2 space-y-2 text-xs text-gray-600">
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>e-Okul'dan Excel indir → burada yükle</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>Listeyi kopyala → yapıştır</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>Sütun adları farklı olsa da sistem tanır</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ExcelUploader
