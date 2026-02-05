/**
 * Core Storage Namespace Helper
 * 
 * Prevents key collisions by enforcing namespaced access to localStorage.
 * Includes safe JSON parsing and optional Zod validation.
 */

import { z } from 'zod'

export interface StorageNamespace {
    getJSON: <T>(key: string, schema?: z.ZodSchema<T>) => T | null
    setJSON: <T>(key: string, value: T) => void
    remove: (key: string) => void
    clear: () => void
}

export function createNamespace(prefix: string): StorageNamespace {
    const getPrefixedKey = (key: string) => `${prefix}.${key}`

    return {
        getJSON: <T>(key: string, schema?: z.ZodSchema<T>): T | null => {
            try {
                const item = localStorage.getItem(getPrefixedKey(key))
                if (!item) return null

                const parsed = JSON.parse(item)

                if (schema) {
                    const result = schema.safeParse(parsed)
                    if (!result.success) {
                        console.error(`[Storage] Validation failed for key '${key}':`, result.error)
                        return null
                    }
                    return result.data
                }

                return parsed as T
            } catch (error) {
                console.error(`[Storage] Failed to read key '${key}':`, error)
                return null
            }
        },

        setJSON: <T>(key: string, value: T): void => {
            try {
                const serialized = JSON.stringify(value)
                localStorage.setItem(getPrefixedKey(key), serialized)
            } catch (error) {
                console.error(`[Storage] Failed to write key '${key}':`, error)
            }
        },

        remove: (key: string): void => {
            localStorage.removeItem(getPrefixedKey(key))
        },

        clear: (): void => {
            // Only clear keys belonging to this namespace
            Object.keys(localStorage).forEach((k) => {
                if (k.startsWith(prefix + '.')) {
                    localStorage.removeItem(k)
                }
            })
        }
    }
}
