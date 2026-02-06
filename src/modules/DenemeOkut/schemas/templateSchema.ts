import { z } from 'zod'

// ============================================
// TEMPLATE SCHEMA (V1)
// ============================================

export const TemplateRegionSchema = z.object({
    xMm: z.number().positive(),
    yMm: z.number().positive(),
    wMm: z.number().positive(),
    hMm: z.number().positive()
})

export const TemplateLayoutSchema = z.object({
    columns: z.number().int().positive(),
    rowHeightMm: z.number().positive(),
    bubbleSizeMm: z.number().positive()
})

export const TemplateSchema = z.object({
    templateId: z.string().min(1),
    version: z.number().int().positive(),
    name: z.string().min(1),
    paperSize: z.enum(['A4', 'A3', 'Letter']),
    orientation: z.enum(['portrait', 'landscape']),
    choices: z.array(z.string().min(1)).min(2),
    questionCount: z.number().int().positive().max(200),
    layout: TemplateLayoutSchema,
    regions: z.record(z.string(), TemplateRegionSchema)
})

export type Template = z.infer<typeof TemplateSchema>
