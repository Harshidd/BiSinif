/**
 * Core Routing Lazy Helper
 * 
 * Typed wrapper for lazy-loading module routes with Suspense fallback.
 * USE THIS for all new feature modules.
 */

import React, { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Creates a lazy-loaded route component with a default Loading fallback.
 * 
 * @param factory - The dynamic import function (e.g., () => import('../../modules/MyModule'))
 * @param LoadingComponent - Optional custom loading fallback (defaults to a simple spinner)
 */
export function createLazyRoute<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    LoadingComponent?: ComponentType
) {
    const LazyComponent = lazy(factory)

    return (props: React.ComponentProps<T>) => (
        <Suspense fallback= { LoadingComponent?<LoadingComponent /> : <DefaultLoading />
}>
    <LazyComponent { ...props } />
    </Suspense>
  )
}

// Simple internal fallback to avoid dependencies
const DefaultLoading = () => (
    <div style= {{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '200px',
        color: '#6B7280'
  }}>
    Yükleniyor...
</div>
)
