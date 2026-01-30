// src/components/report/pdfExport.js
// PDF export fonksiyonları: blob üret + download

import React from "react";
import { pdf } from "@react-pdf/renderer";
import FullReportDocument from "./FullReportDocument";
import StudentCardsDocument from "./StudentCardsDocument";

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

const getDateStamp = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

// ============================================
// EXPORT FONKSİYONLARI
// ============================================

/**
 * TAM ANALİZ RAPORU
 * Sayfa 1: Özet + Analiz
 * Sayfa 2-3: Tam Öğrenci Listesi
 * Sayfa 4: Telafi Listesi
 * Sayfa 5+: Öğrenci Karneleri (2/sayfa)
 */
export const exportFullReportPDF = async ({ analysis, config, questions }) => {
    const doc = React.createElement(FullReportDocument, { analysis, config, questions });
    const blob = await pdf(doc).toBlob();
    downloadBlob(blob, `NetAnaliz_TamRapor_${getDateStamp()}.pdf`);
};

/**
 * SADECE ÖĞRENCİ KARNELERİ
 * Her öğrenci 1 tam sayfa (detaylı)
 */
export const exportStudentCardsPDF = async ({ analysis, config, students }) => {
    const doc = React.createElement(StudentCardsDocument, { analysis, config, students });
    const blob = await pdf(doc).toBlob();
    downloadBlob(blob, `NetAnaliz_Karneler_${getDateStamp()}.pdf`);
};

/**
 * TEK ÖĞRENCİ KARNESİ
 * 1 öğrenci için detaylı karne
 */
export const exportSingleStudentPDF = async ({ analysis, config, student }) => {
    const doc = React.createElement(StudentCardsDocument, {
        analysis,
        config,
        students: [student]
    });
    const blob = await pdf(doc).toBlob();
    const studentName = student?.name || student?.fullName || 'Ogrenci';
    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    downloadBlob(blob, `NetAnaliz_Karne_${safeName}_${getDateStamp()}.pdf`);
};
