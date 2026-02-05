/**
 * Core Observability Logger
 * 
 * Provides a unified interface for logging events across the application.
 * In development, logs to console.
 * In production, this can be wired to analytics/monitoring services.
 */

export interface LogEvent {
    module: string
    action: string
    meta?: Record<string, unknown>
    durationMs?: number
    level?: 'info' | 'warn' | 'error'
}

const IS_DEV = import.meta.env.DEV

export const logger = {
    logEvent: (event: LogEvent) => {
        if (IS_DEV) {
            const { module, action, meta, durationMs, level = 'info' } = event
            const color = level === 'error' ? 'red' : level === 'warn' ? 'orange' : 'blue'

            console.groupCollapsed(`%c[${module}] ${action}`, `color: ${color}; font-weight: bold`)
            if (durationMs !== undefined) console.log(`Duration: ${durationMs}ms`)
            if (meta) console.log('Meta:', meta)
            console.groupEnd()
        }

        // TODO: Wire up production analytics here (e.g., PostHog, Sentry)
    },

    info: (module: string, message: string, meta?: Record<string, unknown>) => {
        logger.logEvent({ module, action: message, meta, level: 'info' })
    },

    warn: (module: string, message: string, meta?: Record<string, unknown>) => {
        logger.logEvent({ module, action: message, meta, level: 'warn' })
    },

    error: (module: string, message: string, meta?: Record<string, unknown>) => {
        logger.logEvent({ module, action: message, meta, level: 'error' })
    }
}
