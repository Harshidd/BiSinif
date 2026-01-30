// src/components/report/StudentCardsDocument.jsx
// Sadece öğrenci karneleri - 1 öğrenci / 1 sayfa (detaylı)

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import './fonts'; // Roboto font kaydı
import {
    sortStudentsByNo,
    toNum,
    safeText,
    getStudentNo,
    getStudentName,
    percent,
    statusText,
    statusColor,
    formatDate
} from "./pdfUtils";

// ============================================
// STİLLER
// ============================================

const colors = {
    primary: "#2563EB",
    success: "#16A34A",
    danger: "#DC2626",
    warning: "#F59E0B",
    muted: "#6B7280",
    border: "#E5E7EB",
    bg: "#F9FAFB",
    bgAlt: "#F3F4F6",
    text: "#111827"
};

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 10,
        fontFamily: "Roboto",
        color: colors.text,
        backgroundColor: "#FFFFFF"
    },

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary
    },
    h1: { fontSize: 18, fontWeight: "bold", color: colors.primary },
    subtitle: { fontSize: 9, color: colors.muted, marginTop: 2 },

    // Student Info Card
    infoCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF"
    },
    banner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    studentName: { fontSize: 16, fontWeight: "bold", color: colors.text },
    studentNo: { fontSize: 11, color: colors.muted, marginTop: 2 },
    badge: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        fontSize: 11,
        fontWeight: "bold"
    },

    // Stats Row
    statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    statBox: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.bg,
        alignItems: "center"
    },
    statLabel: { fontSize: 8, color: colors.muted, marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: "bold", color: colors.text },

    // Section
    section: { marginBottom: 16 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 10,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },

    // Outcome Row
    outcomeRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        backgroundColor: "#FFFFFF"
    },
    outcomeInfo: { flex: 1 },
    outcomeCode: { fontSize: 9, color: colors.muted, marginBottom: 2 },
    outcomeTitle: { fontSize: 10, fontWeight: "bold", color: colors.text },
    outcomeScore: {
        width: 60,
        alignItems: "center",
        justifyContent: "center"
    },
    outcomeScoreText: { fontSize: 14, fontWeight: "bold" },
    outcomeStatus: { fontSize: 8, marginTop: 2 },

    // Bar
    barBg: {
        flex: 1,
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        marginHorizontal: 12,
        overflow: "hidden"
    },
    barFill: { height: 8, borderRadius: 4 },

    // Question Performance
    questionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    questionBox: {
        width: "18%",
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        alignItems: "center",
        backgroundColor: "#FFFFFF"
    },
    questionNo: { fontSize: 8, color: colors.muted, marginBottom: 2 },
    questionScore: { fontSize: 11, fontWeight: "bold" },

    // Footer
    footer: {
        position: "absolute",
        left: 32,
        right: 32,
        bottom: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 8,
        borderTopWidth: 0.5,
        borderTopColor: colors.border
    },
    footerText: { fontSize: 8, color: colors.muted },

    // Comment box
    commentBox: {
        marginTop: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        backgroundColor: colors.bg,
        minHeight: 60
    },
    commentTitle: { fontSize: 9, fontWeight: "bold", color: colors.muted, marginBottom: 4 }
});

// ============================================
// TEK ÖĞRENCİ KARNESİ
// ============================================

const StudentCardPage = ({ student, config, analysis, index, total }) => {
    const threshold = toNum(config?.generalPassingScore ?? config?.passScore ?? 50);
    const configOutcomes = Array.isArray(config?.outcomes) ? config.outcomes : [];

    const studentTotal = toNum(student?.total ?? student?.score ?? student?.puan, 0);
    const durum = statusText(studentTotal, threshold);
    const durumColor = statusColor(studentTotal, threshold);

    // Outcome scores
    const outcomeScores = Array.isArray(student?.outcomeScores) ? student.outcomeScores : [];

    // Question scores (varsa)
    const questionScores = Array.isArray(student?.questionScores) ? student.questionScores : [];

    // Sınıf ortalaması (varsa)
    const classAvg = toNum(analysis?.stats?.avg ?? analysis?.average, 0);
    const classMax = toNum(analysis?.stats?.max ?? analysis?.max, 0);

    return (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.h1}>Öğrenci Karnesi</Text>
                    <Text style={styles.subtitle}>NetAnaliz Sınav Analiz Sistemi</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.subtitle}>{safeText(config?.schoolName)}</Text>
                    <Text style={styles.subtitle}>{safeText(config?.className)} • {safeText(config?.courseName ?? config?.subject)}</Text>
                    <Text style={styles.subtitle}>{formatDate(config?.examDate ?? config?.date)}</Text>
                </View>
            </View>

            {/* Student Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.banner}>
                    <View>
                        <Text style={styles.studentName}>{getStudentName(student)}</Text>
                        <Text style={styles.studentNo}>Öğrenci No: {getStudentNo(student)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: durumColor + "20" }]}>
                        <Text style={{ color: durumColor }}>{durum}</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>TOPLAM PUAN</Text>
                        <Text style={[styles.statValue, { color: durumColor }]}>{studentTotal.toFixed(0)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>SINIF ORT.</Text>
                        <Text style={styles.statValue}>{classAvg.toFixed(1)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>EN YÜKSEK</Text>
                        <Text style={styles.statValue}>{classMax}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>GEÇME PUANI</Text>
                        <Text style={styles.statValue}>{threshold}</Text>
                    </View>
                </View>
            </View>

            {/* Kazanım Performansı */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kazanım Performansı</Text>
                {outcomeScores.length > 0 ? (
                    outcomeScores.map((o, i) => {
                        const title = configOutcomes[i] || o?.title || o?.name || `Kazanım ${i + 1}`;
                        const score = toNum(o?.score ?? o?.rate, 0);
                        const barColor = score >= threshold ? colors.success : colors.warning;

                        return (
                            <View key={`oc-${i}`} style={styles.outcomeRow}>
                                <View style={styles.outcomeInfo}>
                                    <Text style={styles.outcomeCode}>K{i + 1}</Text>
                                    <Text style={styles.outcomeTitle}>{title}</Text>
                                </View>
                                <View style={styles.barBg}>
                                    <View style={[styles.barFill, { width: `${percent(score)}%`, backgroundColor: barColor }]} />
                                </View>
                                <View style={styles.outcomeScore}>
                                    <Text style={[styles.outcomeScoreText, { color: barColor }]}>%{score.toFixed(0)}</Text>
                                    <Text style={[styles.outcomeStatus, { color: barColor }]}>
                                        {score >= threshold ? "Başarılı" : "Telafi"}
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <Text style={{ color: colors.muted, fontStyle: "italic", textAlign: "center", padding: 20 }}>
                        Kazanım verisi bulunamadı.
                    </Text>
                )}
            </View>

            {/* Soru Bazlı Performans (varsa) */}
            {questionScores.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Soru Bazlı Performans</Text>
                    <View style={styles.questionGrid}>
                        {questionScores.slice(0, 20).map((q, i) => {
                            const score = toNum(q?.score ?? q?.earned, 0);
                            const max = toNum(q?.max ?? q?.maxScore, 1);
                            const pct = max > 0 ? (score / max) * 100 : 0;
                            const boxColor = pct >= 70 ? colors.success : pct >= 40 ? colors.warning : colors.danger;
                            return (
                                <View key={`qs-${i}`} style={[styles.questionBox, { borderColor: boxColor }]}>
                                    <Text style={styles.questionNo}>S{q?.qNo ?? i + 1}</Text>
                                    <Text style={[styles.questionScore, { color: boxColor }]}>{score}/{max}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Öğretmen Notu Alanı */}
            <View style={styles.commentBox}>
                <Text style={styles.commentTitle}>ÖĞRETMEN NOTU</Text>
                <Text style={{ fontSize: 9, color: colors.muted }}>
                    {studentTotal >= threshold
                        ? "Başarılı bir performans sergilenmiştir. Çalışmalarına devam etmesi önerilir."
                        : "Eksik kazanımlar için ek çalışma yapılması önerilir. Telafi çalışmalarına katılması beklenmektedir."
                    }
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer} fixed>
                <Text style={styles.footerText}>{safeText(config?.schoolName, "NetAnaliz")}</Text>
                <Text style={styles.footerText}>Sayfa {index + 1} / {total}</Text>
            </View>
        </Page>
    );
};

// ============================================
// ANA DOKÜMAN
// ============================================

export default function StudentCardsDocument({ analysis, config, students }) {
    const studentList = sortStudentsByNo(students ?? analysis?.studentResults ?? []);
    const total = studentList.length;

    if (total === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.h1}>Öğrenci Karnesi</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: colors.muted, fontSize: 14 }}>Öğrenci verisi bulunamadı.</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            {studentList.map((student, idx) => (
                <StudentCardPage
                    key={`scp-${idx}`}
                    student={student}
                    config={config}
                    analysis={analysis}
                    index={idx}
                    total={total}
                />
            ))}
        </Document>
    );
}
