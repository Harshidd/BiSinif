// src/components/report/FullReportDocument.jsx
// TAM ANALİZ RAPORU: Özet + Liste + Telafi + Karneler (2/sayfa)

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import './fonts'; // Font kaydı
import {
    chunk,
    sortStudentsByNo,
    toNum,
    safeText,
    percent,
    getStudentNo,
    getStudentName,
    statusText,
    statusColor,
    formatDate,
    getDistributionBuckets,
    calculateStats,
    shortName
} from "./pdfUtils";

// ============================================
// STİLLER - Kompakt ve Profesyonel
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
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 24,
        fontSize: 9,
        fontFamily: "Roboto",
        color: colors.text,
        backgroundColor: "#FFFFFF"
    },

    // Header
    header: {
        marginBottom: 10,
        paddingBottom: 6,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end"
    },
    h1: { fontSize: 14, fontWeight: "bold", color: colors.primary },
    h2: { fontSize: 11, fontWeight: "bold", color: colors.text, marginBottom: 6 },
    h3: { fontSize: 10, fontWeight: "bold", color: colors.text, marginBottom: 4 },
    subtitle: { fontSize: 8, color: colors.muted },

    // Grid & Cards
    row: { flexDirection: "row", gap: 8 },
    col2: { flex: 1 },
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        padding: 8,
        backgroundColor: "#FFFFFF",
        marginBottom: 8
    },
    cardTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 6, color: colors.text },

    // Stats Row
    statsRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
    statBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        padding: 6,
        backgroundColor: colors.bg,
        alignItems: "center"
    },
    statLabel: { fontSize: 7, color: colors.muted, marginBottom: 2 },
    statValue: { fontSize: 12, fontWeight: "bold", color: colors.text },
    statSub: { fontSize: 7, color: colors.muted },

    // Table
    table: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        overflow: "hidden"
    },
    trHead: {
        flexDirection: "row",
        backgroundColor: colors.bgAlt,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    tr: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border
    },
    trAlt: {
        flexDirection: "row",
        backgroundColor: colors.bg,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border
    },
    th: { padding: 4, fontWeight: "bold", fontSize: 8, color: colors.muted },
    td: { padding: 4, fontSize: 8 },
    tdBold: { padding: 4, fontSize: 8, fontWeight: "bold" },

    // Column widths
    colSira: { width: "8%" },
    colNo: { width: "12%" },
    colAd: { width: "50%" },
    colPuan: { width: "15%", textAlign: "right" },
    colDurum: { width: "15%", textAlign: "right" },

    // Bar chart
    barRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
    barLabel: { width: 40, fontSize: 8, color: colors.muted },
    barBg: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" },
    barFill: { height: 8, borderRadius: 4 },
    barValue: { width: 24, fontSize: 8, textAlign: "right", fontWeight: "bold" },

    // Mini bar
    miniBarBg: { height: 5, backgroundColor: colors.border, borderRadius: 2, overflow: "hidden", marginTop: 2 },
    miniBarFill: { height: 5, borderRadius: 2 },

    // Student Cards (2 per page)
    twoCardWrap: { flexDirection: "row", gap: 10, flex: 1 },
    studentCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        padding: 10,
        backgroundColor: "#FFFFFF"
    },
    studentBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    studentName: { fontSize: 10, fontWeight: "bold" },
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
        fontSize: 8,
        fontWeight: "bold"
    },

    // Footer
    footer: {
        position: "absolute",
        left: 24,
        right: 24,
        bottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 4,
        borderTopWidth: 0.5,
        borderTopColor: colors.border
    },
    footerText: { fontSize: 7, color: colors.muted },

    // Meta info row
    metaRow: { flexDirection: "row", gap: 5, marginBottom: 8 },
    metaBox: {
        flex: 1,
        padding: 5,
        backgroundColor: colors.bg,
        borderRadius: 3,
        alignItems: "center"
    },
    metaLabel: { fontSize: 6, color: colors.muted },
    metaValue: { fontSize: 8, fontWeight: "bold", color: colors.text },

    // Remedial section
    remedialSection: {
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    outcomeTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
    remedialCount: { fontSize: 8, color: colors.danger, marginBottom: 6 }
});

// ============================================
// YARDIMCI BİLEŞENLER
// ============================================

const Header = ({ title, config }) => (
    <View style={styles.header}>
        <View>
            <Text style={styles.h1}>{title}</Text>
            <Text style={styles.subtitle}>NetAnaliz Sınav Analiz Sistemi</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.subtitle}>{safeText(config?.schoolName)}</Text>
            <Text style={styles.subtitle}>{formatDate(config?.examDate ?? config?.date)}</Text>
        </View>
    </View>
);

const Footer = ({ schoolName }) => (
    <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{safeText(schoolName, "NetAnaliz")}</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
    </View>
);

const StatBox = ({ label, value, sub, color }) => (
    <View style={styles.statBox}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
        {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
);

const Bar = ({ value, max, color = colors.success }) => {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
    );
};

const MiniBar = ({ value, color = colors.success }) => {
    const pct = percent(value);
    return (
        <View style={styles.miniBarBg}>
            <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
    );
};

// ============================================
// SAYFA 1: ÖZET + ANALİZ (Öğrenci Listesi YOK)
// ============================================

const SummaryAndAnalysisPage = ({ analysis, config }) => {
    const students = sortStudentsByNo(analysis?.studentResults ?? []);
    const threshold = toNum(config?.generalPassingScore ?? config?.passScore ?? 50);
    const stats = calculateStats(students);
    const distribution = getDistributionBuckets(students, threshold);
    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    const passCount = students.filter(s => toNum(s?.total, 0) >= threshold).length;
    const failCount = students.length - passCount;
    const successRate = students.length > 0 ? (passCount / students.length) * 100 : 0;

    const outcomes = Array.isArray(analysis?.outcomes) ? analysis.outcomes : [];
    const questions = Array.isArray(analysis?.questionStats)
        ? analysis.questionStats
        : (Array.isArray(analysis?.questions) ? analysis.questions : []);
    const configOutcomes = Array.isArray(config?.outcomes) ? config.outcomes : [];

    return (
        <Page size="A4" style={styles.page}>
            <Header title="Sınav Analiz Raporu" config={config} />

            {/* Meta Bilgiler */}
            <View style={styles.metaRow}>
                <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>OKUL</Text>
                    <Text style={styles.metaValue}>{safeText(config?.schoolName)}</Text>
                </View>
                <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>SINIF</Text>
                    <Text style={styles.metaValue}>{safeText(config?.className)}</Text>
                </View>
                <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>DERS</Text>
                    <Text style={styles.metaValue}>{safeText(config?.courseName ?? config?.subject)}</Text>
                </View>
                <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>ÖĞRETMEN</Text>
                    <Text style={styles.metaValue}>{safeText(config?.teacherName)}</Text>
                </View>
                <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>TARİH</Text>
                    <Text style={styles.metaValue}>{formatDate(config?.examDate ?? config?.date)}</Text>
                </View>
            </View>

            {/* İstatistik Kartları */}
            <View style={styles.statsRow}>
                <StatBox label="KATILIM" value={stats.count} sub={`${students.length} kayıtlı`} />
                <StatBox label="SINIF ORT." value={stats.avg.toFixed(1)} color={colors.primary} />
                <StatBox label="BAŞARILI" value={passCount} sub={`%${successRate.toFixed(0)}`} color={colors.success} />
                <StatBox label="BAŞARISIZ" value={failCount} sub={`%${(100 - successRate).toFixed(0)}`} color={colors.danger} />
                <StatBox label="GEÇME PUANI" value={threshold} color={colors.warning} />
            </View>

            {/* 2 Kolon: Dağılım + İstatistik */}
            <View style={styles.row}>
                {/* Sol: Başarı Dağılımı */}
                <View style={[styles.card, styles.col2]}>
                    <Text style={styles.cardTitle}>Başarı Dağılımı</Text>
                    {distribution.map((bucket) => (
                        <View key={bucket.label} style={styles.barRow}>
                            <Text style={styles.barLabel}>{bucket.label}</Text>
                            <Bar value={bucket.count} max={maxCount} color={bucket.color} />
                            <Text style={styles.barValue}>{bucket.count}</Text>
                        </View>
                    ))}
                </View>

                {/* Sağ: Temel İstatistikler */}
                <View style={[styles.card, styles.col2]}>
                    <Text style={styles.cardTitle}>Temel İstatistikler</Text>
                    <View style={{ gap: 4 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.muted }}>Ortalama</Text>
                            <Text style={{ fontWeight: "bold" }}>{stats.avg.toFixed(1)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.muted }}>Medyan</Text>
                            <Text style={{ fontWeight: "bold" }}>{stats.median.toFixed(1)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.muted }}>En Yüksek</Text>
                            <Text style={{ fontWeight: "bold", color: colors.success }}>{stats.max}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.muted }}>En Düşük</Text>
                            <Text style={{ fontWeight: "bold", color: colors.danger }}>{stats.min}</Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ color: colors.muted }}>Standart Sapma</Text>
                            <Text style={{ fontWeight: "bold" }}>{stats.std.toFixed(1)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Kazanım Analizi (Kompakt) */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Kazanım Analizi</Text>
                {outcomes.length === 0 ? (
                    <Text style={{ color: colors.muted, fontStyle: "italic" }}>Kazanım verisi yok</Text>
                ) : (
                    outcomes.slice(0, 6).map((o, i) => {
                        const title = configOutcomes[i] || o?.title || o?.name || `Kazanım ${i + 1}`;
                        const rate = toNum(o?.successRate ?? o?.rate, 0);
                        const failedCount = Array.isArray(o?.failedStudents) ? o.failedStudents.length : 0;
                        const barColor = rate >= threshold ? colors.success : colors.warning;

                        return (
                            <View key={`out-${i}`} style={{ marginBottom: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                                        <Text style={{ color: colors.muted }}>K{i + 1} </Text>
                                        {title.length > 40 ? title.slice(0, 40) + "..." : title}
                                    </Text>
                                    <Text style={{ fontSize: 8, fontWeight: "bold", color: barColor }}>
                                        %{rate.toFixed(0)} {failedCount > 0 && <Text style={{ color: colors.danger }}>• {failedCount} telafi</Text>}
                                    </Text>
                                </View>
                                <MiniBar value={rate} color={barColor} />
                            </View>
                        );
                    })
                )}
                {outcomes.length > 6 && (
                    <Text style={{ fontSize: 7, color: colors.muted, marginTop: 4 }}>
                        Not: İlk 6 kazanım gösterildi. Toplam: {outcomes.length}
                    </Text>
                )}
            </View>

            {/* Soru Analizi (Kompakt Tablo) */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Soru Analizi</Text>
                {questions.length === 0 ? (
                    <Text style={{ color: colors.muted, fontStyle: "italic" }}>Soru verisi yok</Text>
                ) : (
                    <View style={styles.table}>
                        <View style={styles.trHead}>
                            <Text style={[styles.th, { width: "10%" }]}>Soru</Text>
                            <Text style={[styles.th, { width: "10%" }]}>Kaz.</Text>
                            <Text style={[styles.th, { width: "10%" }]}>Max</Text>
                            <Text style={[styles.th, { width: "50%" }]}>Zorluk</Text>
                            <Text style={[styles.th, { width: "20%", textAlign: "right" }]}>Başarı</Text>
                        </View>
                        {questions.slice(0, 10).map((q, i) => {
                            const difficulty = toNum(q?.difficulty ?? q?.avgScore ?? q?.correctRate, 0);
                            const diffPct = difficulty > 1 ? difficulty : difficulty * 100;
                            const barColor = diffPct > 70 ? colors.success : diffPct < 40 ? colors.danger : colors.primary;
                            const rowStyle = i % 2 === 0 ? styles.tr : styles.trAlt;

                            return (
                                <View key={`q-${i}`} style={rowStyle}>
                                    <Text style={[styles.td, { width: "10%" }]}>S{q?.qNo ?? i + 1}</Text>
                                    <Text style={[styles.td, { width: "10%" }]}>K{toNum(q?.outcomeId, 0) + 1}</Text>
                                    <Text style={[styles.td, { width: "10%" }]}>{q?.maxScore ?? "-"}</Text>
                                    <View style={[styles.td, { width: "50%", flexDirection: "row", alignItems: "center" }]}>
                                        <View style={{ flex: 1 }}>
                                            <MiniBar value={diffPct} color={barColor} />
                                        </View>
                                    </View>
                                    <Text style={[styles.td, { width: "20%", textAlign: "right", fontWeight: "bold", color: barColor }]}>
                                        %{diffPct.toFixed(0)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}
                {questions.length > 10 && (
                    <Text style={{ fontSize: 7, color: colors.muted, marginTop: 4 }}>
                        Not: İlk 10 soru gösterildi. Toplam: {questions.length}
                    </Text>
                )}
            </View>

            <Footer schoolName={config?.schoolName} />
        </Page>
    );
};

// ============================================
// SAYFA 2-3: TAM SINIF LİSTESİ
// ============================================

const ClassListPages = ({ analysis, config }) => {
    const threshold = toNum(config?.generalPassingScore ?? config?.passScore ?? 50);
    const students = sortStudentsByNo(analysis?.studentResults ?? []);

    if (students.length === 0) return null;

    const ROWS_PER_PAGE = 42; // Kompakt, boşluk minimize
    const pages = chunk(students, ROWS_PER_PAGE);

    return pages.map((rows, pageIdx) => (
        <Page key={`class-${pageIdx}`} size="A4" style={styles.page}>
            <Header title={`Sınıf Listesi (${pageIdx + 1}/${pages.length})`} config={config} />

            <View style={styles.table}>
                <View style={styles.trHead}>
                    <Text style={[styles.th, styles.colSira]}>Sıra</Text>
                    <Text style={[styles.th, styles.colNo]}>No</Text>
                    <Text style={[styles.th, styles.colAd]}>Ad Soyad</Text>
                    <Text style={[styles.th, styles.colPuan]}>Puan</Text>
                    <Text style={[styles.th, styles.colDurum]}>Durum</Text>
                </View>

                {rows.map((s, i) => {
                    const globalIndex = pageIdx * ROWS_PER_PAGE + i + 1;
                    const total = toNum(s?.total, 0);
                    const durum = statusText(total, threshold);
                    const rowStyle = i % 2 === 0 ? styles.tr : styles.trAlt;
                    return (
                        <View key={`cl-${globalIndex}`} style={rowStyle}>
                            <Text style={[styles.td, styles.colSira]}>{globalIndex}</Text>
                            <Text style={[styles.td, styles.colNo]}>{getStudentNo(s)}</Text>
                            <Text style={[styles.td, styles.colAd]}>{getStudentName(s)}</Text>
                            <Text style={[styles.tdBold, styles.colPuan]}>{total.toFixed(0)}</Text>
                            <Text style={[styles.td, styles.colDurum, { color: statusColor(total, threshold) }]}>{durum}</Text>
                        </View>
                    );
                })}
            </View>

            <Footer schoolName={config?.schoolName} />
        </Page>
    ));
};

// ============================================
// SAYFA 4: TELAFİ LİSTESİ (Ayrı Sayfa)
// ============================================

const RemedialPage = ({ analysis, config }) => {
    const outcomes = Array.isArray(analysis?.outcomes) ? analysis.outcomes : [];
    const configOutcomes = Array.isArray(config?.outcomes) ? config.outcomes : [];
    const threshold = toNum(config?.generalPassingScore ?? config?.passScore ?? 50);

    // En az 1 telafi öğrencisi olan kazanımlar
    const outcomesWithRemedial = outcomes.filter(o => {
        const failed = Array.isArray(o?.failedStudents) ? o.failedStudents : [];
        return failed.length > 0;
    });

    if (outcomesWithRemedial.length === 0) return null;

    return (
        <Page size="A4" style={styles.page}>
            <Header title="Telafi Listesi" config={config} />

            {outcomesWithRemedial.map((outcome, idx) => {
                const outcomeIndex = outcomes.indexOf(outcome);
                const title = configOutcomes[outcomeIndex] || outcome?.title || outcome?.name || `Kazanım ${outcomeIndex + 1}`;
                const failedStudents = sortStudentsByNo(outcome?.failedStudents ?? []);

                return (
                    <View key={`remedial-${idx}`} style={styles.remedialSection}>
                        <Text style={styles.outcomeTitle}>
                            K{outcomeIndex + 1}: {title}
                        </Text>
                        <Text style={styles.remedialCount}>
                            Telafi Gereken: {failedStudents.length} öğrenci
                        </Text>

                        <View style={styles.table}>
                            <View style={styles.trHead}>
                                <Text style={[styles.th, { width: "15%" }]}>No</Text>
                                <Text style={[styles.th, { width: "60%" }]}>Ad Soyad</Text>
                                <Text style={[styles.th, { width: "25%", textAlign: "right" }]}>Puan</Text>
                            </View>
                            {failedStudents.map((student, i) => {
                                const rowStyle = i % 2 === 0 ? styles.tr : styles.trAlt;
                                return (
                                    <View key={`rem-${idx}-${i}`} style={rowStyle}>
                                        <Text style={[styles.td, { width: "15%" }]}>{getStudentNo(student)}</Text>
                                        <Text style={[styles.td, { width: "60%" }]}>{getStudentName(student)}</Text>
                                        <Text style={[styles.td, { width: "25%", textAlign: "right" }]}>{toNum(student?.total, 0)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                );
            })}

            <Footer schoolName={config?.schoolName} />
        </Page>
    );
};

// ============================================
// SAYFA 5+: ÖĞRENCİ KARNELERİ (2 öğrenci / 1 sayfa)
// ============================================

const CompactStudentCardsPages = ({ analysis, config }) => {
    const threshold = toNum(config?.generalPassingScore ?? config?.passScore ?? 50);
    const students = sortStudentsByNo(analysis?.studentResults ?? []);
    const configOutcomes = Array.isArray(config?.outcomes) ? config.outcomes : [];
    const pairs = chunk(students, 2);

    if (students.length === 0) return null;

    const StudentCard = ({ student }) => {
        const total = toNum(student?.total, 0);
        const durum = statusText(total, threshold);
        const durumColor = statusColor(total, threshold);
        const outcomeScores = Array.isArray(student?.outcomeScores) ? student.outcomeScores : [];

        return (
            <View style={styles.studentCard}>
                <View style={styles.studentBanner}>
                    <View>
                        <Text style={styles.studentName}>{getStudentName(student)}</Text>
                        <Text style={{ fontSize: 8, color: colors.muted }}>No: {getStudentNo(student)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: durumColor + "20" }]}>
                        <Text style={{ color: durumColor }}>{durum} • {total.toFixed(0)}</Text>
                    </View>
                </View>

                <Text style={styles.h3}>Kazanım Performansı</Text>
                {outcomeScores.length > 0 ? (
                    outcomeScores.slice(0, 5).map((o, i) => {
                        const title = configOutcomes[i] || o?.title || o?.name || `Kazanım ${i + 1}`;
                        const score = toNum(o?.score ?? o?.rate, 0);
                        const barColor = score >= threshold ? colors.success : colors.warning;
                        return (
                            <View key={`os-${i}`} style={{ marginBottom: 5 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ fontSize: 7 }}>
                                        <Text style={{ color: colors.muted }}>K{i + 1} </Text>
                                        {title.length > 20 ? title.slice(0, 20) + "..." : title}
                                    </Text>
                                    <Text style={{ fontSize: 7, fontWeight: "bold", color: barColor }}>%{score.toFixed(0)}</Text>
                                </View>
                                <MiniBar value={score} color={barColor} />
                            </View>
                        );
                    })
                ) : (
                    <Text style={{ fontSize: 7, color: colors.muted, fontStyle: "italic" }}>Kazanım verisi yok</Text>
                )}
            </View>
        );
    };

    return pairs.map((pair, idx) => (
        <Page key={`cards-${idx}`} size="A4" style={styles.page}>
            <Header title={`Öğrenci Karneleri (${idx + 1}/${pairs.length})`} config={config} />

            <View style={styles.twoCardWrap}>
                {pair.map((student, i) => (
                    <StudentCard key={`sc-${idx}-${i}`} student={student} />
                ))}
                {pair.length === 1 && <View style={{ flex: 1 }} />}
            </View>

            <Footer schoolName={config?.schoolName} />
        </Page>
    ));
};

// ============================================
// ANA DOKÜMAN
// ============================================

export default function FullReportDocument({ analysis, config, questions }) {
    const enrichedAnalysis = {
        ...analysis,
        questions: questions ?? analysis?.questions ?? analysis?.questionStats ?? []
    };

    return (
        <Document>
            <SummaryAndAnalysisPage analysis={enrichedAnalysis} config={config} />
            <ClassListPages analysis={enrichedAnalysis} config={config} />
            <RemedialPage analysis={enrichedAnalysis} config={config} />
            <CompactStudentCardsPages analysis={enrichedAnalysis} config={config} />
        </Document>
    );
}
