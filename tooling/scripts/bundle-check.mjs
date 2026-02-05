/**
 * Bundle Size Guard
 * PATCH-3: JSON Report Generation
 */

import { readdirSync, statSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'

const DIST_DIR = 'dist/assets'
const REPORT_DIR = 'tooling/reports'
const REPORT_FILE = join(REPORT_DIR, 'bundle-report.json')
const WARNING_THRESHOLD_KB = 900

function checkBundle() {
    console.log('📦 Running Bundle Guard...')

    try {
        const files = readdirSync(DIST_DIR)
        const jsFiles = files.filter(f => f.endsWith('.js'))

        const chunks = []

        for (const file of jsFiles) {
            const path = join(DIST_DIR, file)
            const stats = statSync(path)
            const sizeKB = stats.size / 1024
            chunks.push({
                file,
                sizeKb: parseFloat(sizeKB.toFixed(2)),
                type: 'js'
            })
        }

        // Sort by size desc
        chunks.sort((a, b) => b.sizeKb - a.sizeKb)

        const largest = chunks[0] || null

        // Warnings
        chunks.forEach(c => {
            if (c.sizeKb > WARNING_THRESHOLD_KB) {
                console.warn(`⚠️  WARNING: Chunk ${c.file} is ${c.sizeKb}KB (Threshold: ${WARNING_THRESHOLD_KB}KB)`)
            }
        })

        if (!largest) {
            console.log('ℹ️  No JS assets found.')
        } else {
            console.log(`✅ Bundle check complete. Largest chunk: ${largest.file} (${largest.sizeKb}KB)`)
        }

        // Generate Report
        const report = {
            timestamp: new Date().toISOString(),
            thresholdKb: WARNING_THRESHOLD_KB,
            largestChunk: largest,
            allChunksTop10: chunks.slice(0, 10)
        }

        mkdirSync(REPORT_DIR, { recursive: true })
        writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2))
        console.log(`📄 Report saved to ${REPORT_FILE}`)

    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error('❌ dist/assets not found. Run "npm run build" first.')
            // Cannot check, but don't fail build step if strictly just a check
            process.exit(1)
        }
        console.error(err)
        process.exit(1)
    }
}

checkBundle()
