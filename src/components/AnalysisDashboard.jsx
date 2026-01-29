import React, { useState, useMemo, useRef } from 'react'
import { Button } from './ui/Button'
import { Download, Printer, FileSpreadsheet, LayoutGrid } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { buildAnalysis } from '../core/analysisEngine'

// Components
import { AnalysisSidebar } from './analysis/AnalysisSidebar'
import { SummarySection } from './analysis/SummarySection'
import { ClassAnalysisSection } from './analysis/ClassAnalysisSection'
import { OutcomeAnalysisSection } from './analysis/OutcomeAnalysisSection'
import { ItemAnalysisSection } from './analysis/ItemAnalysisSection'
import { StudentReportSection } from './analysis/StudentReportSection'
import ReportPrintView from './report/ReportPrintView'

const AnalysisDashboard = ({ students, grades, questions, config }) => {
  const [activeSection, setActiveSection] = useState('ozet')
  const [isExporting, setIsExporting] = useState(false)
  const printRef = useRef(null)

  // 1. Core Analysis Calculation
  const analysis = useMemo(() => {
    return buildAnalysis({
      students,
      grades,
      questions,
      outcomes: config.outcomes || [],
      generalPassingScore: config.generalPassingScore || 50,
      outcomeMasteryThreshold: config.outcomeMasteryThreshold || 50
    })
  }, [students, grades, questions, config])

  // 2. Export Functions
  const handlePrint = () => {
    window.print()
  }

  const exportToPDF = async () => {
    setIsExporting(true)

    const container = printRef.current
    if (!container) {
      console.error("Print reference not found")
      alert("PDF hazırlanamadı: Bileşen yüklenemedi.")
      setIsExporting(false)
      return
    }

    // Store original styles for restoration
    const originalStyles = {
      position: container.style.position,
      left: container.style.left,
      top: container.style.top,
      visibility: container.style.visibility,
      display: container.style.display,
      width: container.style.width,
      height: container.style.height,
      overflow: container.style.overflow,
      opacity: container.style.opacity,
      pointerEvents: container.style.pointerEvents,
      zIndex: container.style.zIndex
    }

    try {
      // Make container visible for capture (offscreen but fully rendered)
      container.style.position = 'fixed'
      container.style.left = '-10000px'
      container.style.top = '0'
      container.style.visibility = 'visible'
      container.style.display = 'block'
      container.style.width = '794px'
      container.style.height = 'auto'
      container.style.overflow = 'visible'
      container.style.opacity = '1'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '-1'

      // Wait for fonts and rendering
      if (document.fonts?.ready) {
        await document.fonts.ready
      }
      // Double requestAnimationFrame for layout flush
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise(resolve => setTimeout(resolve, 300))

      const doc = new jsPDF('p', 'mm', 'a4')
      const pages = container.querySelectorAll('.a4-page')
      const pdfWidth = doc.internal.pageSize.getWidth()
      const pdfHeight = doc.internal.pageSize.getHeight()

      console.log('[PDF] Pages found:', pages.length)

      if (pages.length === 0) {
        throw new Error("Yazdırılacak sayfa bulunamadı (.a4-page elementi yok)")
      }

      let addedPages = 0
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i]

        // Force page dimensions if zero
        let rect = pageEl.getBoundingClientRect()
        console.log(`[PDF] Page ${i + 1} initial rect:`, rect.width, 'x', rect.height)

        if (rect.height < 10) {
          // Force explicit dimensions
          pageEl.style.minHeight = '1123px'
          pageEl.style.height = '1123px'
          pageEl.style.width = '794px'
          pageEl.style.display = 'block'
          pageEl.style.visibility = 'visible'

          // Re-flush layout
          await new Promise(r => requestAnimationFrame(r))
          rect = pageEl.getBoundingClientRect()
          console.log(`[PDF] Page ${i + 1} after fix:`, rect.width, 'x', rect.height)
        }

        if (rect.height < 10) {
          console.error(`[PDF] Page ${i + 1} still has zero height, skipping`)
          continue
        }

        if (addedPages > 0) doc.addPage()

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: false,
          imageTimeout: 15000,
          logging: false
        })

        console.log(`[PDF] Canvas ${i + 1}:`, canvas?.width, 'x', canvas?.height)

        if (!canvas || canvas.width < 10 || canvas.height < 10) {
          throw new Error(`Canvas boş (sayfa ${i + 1}): ${canvas?.width}x${canvas?.height}`)
        }

        let imgData
        try {
          imgData = canvas.toDataURL('image/jpeg', 0.92)
        } catch (e) {
          throw new Error(`toDataURL hatası (sayfa ${i + 1}): ${e?.message || e}`)
        }

        if (!imgData || !imgData.startsWith('data:image/')) {
          throw new Error(`Geçersiz dataURL (sayfa ${i + 1})`)
        }

        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
        addedPages++
      }

      if (addedPages === 0) {
        throw new Error("Hiçbir sayfa PDF'e eklenemedi")
      }

      doc.save(`NetAnaliz_Rapor_${new Date().toISOString().slice(0, 10)}.pdf`)
      console.log('[PDF] Export complete!', addedPages, 'pages')
    } catch (error) {
      console.error('[PDF] Export Error:', error)
      alert('PDF oluşturulurken bir hata oluştu: ' + error.message)
    } finally {
      // Restore original styles
      container.style.position = originalStyles.position
      container.style.left = originalStyles.left
      container.style.top = originalStyles.top
      container.style.visibility = originalStyles.visibility
      container.style.display = originalStyles.display
      container.style.width = originalStyles.width
      container.style.height = originalStyles.height
      container.style.overflow = originalStyles.overflow
      container.style.opacity = originalStyles.opacity
      container.style.pointerEvents = originalStyles.pointerEvents
      container.style.zIndex = originalStyles.zIndex
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(analysis.studentResults.map(s => ({
      'Öğrenci No': s.no || s.studentNumber,
      'Ad Soyad': s.name,
      'Puan': s.total,
      'Durum': s.isPassing ? 'Geçti' : 'Kaldı',
      'Sıralama': s.rank
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sinif_Listesi")
    XLSX.writeFile(wb, "NetAnaliz_Sinif_Listesi.xlsx")
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'ozet': return <SummarySection analysis={analysis} config={config} />
      case 'sinif': return <ClassAnalysisSection analysis={analysis} config={config} />
      case 'kazanim': return <OutcomeAnalysisSection analysis={analysis} config={config} />
      case 'soru': return <ItemAnalysisSection analysis={analysis} config={config} />
      case 'karne': return <StudentReportSection analysis={analysis} config={config} />
      default: return <SummarySection analysis={analysis} config={config} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 shadow-sm no-print screen-only">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">NetAnaliz Raporu</h1>
              <p className="text-xs text-slate-500 mt-1">{config.schoolName || 'Okul Adı Girilmedi'} • {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="hidden md:flex">
              <Printer className="w-4 h-4 mr-2" /> Yazdır
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel} className="hidden md:flex border-green-200 text-green-700 hover:bg-green-50">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 group min-w-[120px]"
            >
              {isExporting ? (
                <span className="flex items-center">Hazırlanıyor...</span>
              ) : (
                <span className="flex items-center"><Download className="w-4 h-4 mr-2 group-hover:animate-bounce" /> PDF İndir</span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 screen-only">
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-28 no-print">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Rapor Bölümleri</h3>
              <AnalysisSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>
          </aside>

          {/* Mobile Nav */}
          <div className="md:hidden w-full overflow-x-auto pb-2 -mt-4 mb-4 scrollbar-hide no-print">
            <div className="flex gap-2 min-w-max">
              <AnalysisSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white/50 min-h-[500px] rounded-3xl print:p-0">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>

      {/* Hidden Print Container for PDF Generation - Offscreen but rendered */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm' }}>
        <div ref={printRef}>
          <ReportPrintView analysis={analysis} config={config} />
        </div>
      </div>
    </div>
  )
}

export default AnalysisDashboard
