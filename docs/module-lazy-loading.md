# Module Lazy Loading Guidelines

To keep the application fast and the initial bundle small, all new Feature Modules must be lazy-loaded.

## How to use `createLazyRoute`

Instead of importing module pages directly in `App.tsx` or your router config:

### ❌ Bad (Eager Import)
```typescript
import DenemeOkut from './modules/DenemeOkut' // Increases bundle size immediately!

// ...
<Route path="/deneme-okut/*" element={<DenemeOkut />} />
```

### ✅ Good (Lazy Import)
```typescript
import { createLazyRoute } from './core/routing/lazy'

const DenemeOkutLazy = createLazyRoute(() => import('./modules/DenemeOkut'))

// ...
<Route path="/deneme-okut/*" element={<DenemeOkutLazy />} />
```

## When to use?
- ALWAYS use for top-level Module entry points (e.g., `/class`, `/exams`, `/deneme-okut`).
- Use for heavy sub-pages (e.g., specific heavy dashboards).
- Do NOT use for small, frequently used shared components (buttons, inputs).
