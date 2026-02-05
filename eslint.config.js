import importPlugin from 'eslint-plugin-import'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import fs from 'fs'
import path from 'path'

// === PATCH-1: DYNAMIC MODULE BOUNDARIES ===
// Generates zones automatically based on folders in src/modules.
const MODULES_DIR = './src/modules'
const dynamicZones = []

try {
    if (fs.existsSync(MODULES_DIR)) {
        const modules = fs.readdirSync(MODULES_DIR)
            .filter(f => fs.statSync(path.join(MODULES_DIR, f)).isDirectory())

        modules.forEach(targetMod => {
            modules.forEach(sourceMod => {
                if (targetMod !== sourceMod) {
                    dynamicZones.push({
                        target: `./src/modules/${targetMod}`,
                        from: `./src/modules/${sourceMod}`,
                        message: `VIOLATION: Module Boundary! '${targetMod}' cannot import from sibling '${sourceMod}'.`
                    })
                }
            })
        })
    }
} catch (e) {
    console.warn("⚠️ ESLint could not auto-detect modules:", e)
}

export default [
    {
        ignores: ['dist/**', 'node_modules/**', '.git/**', 'tooling/reports/**']
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            import: importPlugin,
            '@typescript-eslint': tsPlugin
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            // GENERIC MODULE BOUNDARY RULE
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        ...dynamicZones,
                        // Additional rule: Prevent modules from importing 'db' internals from others explicitly (redundant but safe)
                    ]
                }
            ]
        }
    }
]
