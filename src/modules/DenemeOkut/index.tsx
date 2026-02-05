/**
 * DenemeOkut Module - Main Entry Point
 * 
 * HARD RULES:
 * - Isolated from ClassManagement and ExamAnalysis
 * - All routes under /deneme-okut/*
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import Dashboard from './pages/Dashboard'
import ExamList from './pages/ExamList'
import CreateExam from './pages/CreateExam'
import ScanPage from './pages/ScanPage'

export default function DenemeOkut() {
    return (
        <Routes>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Exam Management */}
            <Route path="denemeler" element={<ExamList />} />
            <Route path="denemeler/yeni" element={<CreateExam />} />

            {/* Scanning */}
            <Route path="tara" element={<ScanPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/deneme-okut" replace />} />
        </Routes>
    )
}
