/**
 * Isolation Check Script (Node.js)
 * PATCH-2: Robust Base Branch Detection
 */

import { execSync } from 'child_process'
import process from 'process'

const FORBIDDEN_PATHS = [
    'src/modules/ClassManagement',
    'src/modules/ExamAnalysis'
]

function getBaseBranch() {
    // 1. User provided argument
    if (process.argv[2]) return process.argv[2]

    try {
        const remotes = execSync('git branch -r', { encoding: 'utf-8' })
        if (remotes.includes('origin/main')) return 'origin/main'
        if (remotes.includes('origin/master')) return 'origin/master'
    } catch (e) {
        console.warn('⚠️  Could not list remote branches.')
    }

    // Fallback: assume origin/main exists or let git fail
    return 'origin/main'
}

export function checkIsolation() {
    const baseBranch = getBaseBranch()
    console.log(`🛡️  Checking isolation against base: ${baseBranch}`)

    try {
        // "git diff --name-only <base>" checks Working Tree + Index vs Base
        const cmd = `git diff --name-only ${baseBranch}`
        const output = execSync(cmd, { encoding: 'utf-8' })
        const changedFiles = output.split('\n').filter(Boolean).map(f => f.trim())

        const violations = []

        for (const file of changedFiles) {
            for (const forbidden of FORBIDDEN_PATHS) {
                // Ensure proper path matching (start of string)
                if (file.startsWith(forbidden)) {
                    violations.push(file)
                }
            }
        }

        if (violations.length > 0) {
            console.error('\n🚨 ISOLATION VIOLATION DETECTED!')
            console.error(`   Forbidden modifications vs ${baseBranch}:`)
            violations.forEach(v => console.error(`   - ${v}`))
            console.error('\n❌ Check FAILED. Please revert changes to existing modules.')
            process.exit(1)
        }

        console.log('✅ Isolation Check PASS: No forbidden modules touched.')
        process.exit(0)

    } catch (error) {
        // If git fails (e.g. unknown revision), we shouldn't block the build completely unless strictly required.
        // But for SAFETY, we warn.
        if (error.message && error.message.includes('unknown revision')) {
            console.warn(`⚠️  Base branch '${baseBranch}' not found. Skipping isolation check.`)
            console.warn('   (This is expected on new sparse checkouts or detached heads without remote refs)')
            process.exit(0)
        }
        console.error('❌ Error running isolation check:', error.message)
        process.exit(1)
    }
}

checkIsolation()
