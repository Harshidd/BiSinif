import { z } from 'zod';

// OMR Result Status Enum
export enum OmrStatus {
    SUCCESS = 'SUCCESS',
    PARTIAL = 'PARTIAL',
    FAILED = 'FAILED'
}

// Coordinate Schema (X, Y in normalized 0-1 range or pixels)
export const PointSchema = z.object({
    x: z.number(),
    y: z.number()
});

// Bounding Box Schema
export const BoxSchema = z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
});

// Single Answer Schema
export const AnswerSchema = z.object({
    questionIndex: z.number().int().min(0),
    markedOption: z.string().nullable(), // 'A', 'B', etc. or null if empty
    confidence: z.number().min(0).max(1), // 0 to 1
    box: BoxSchema.optional() // Location on image for debugging
});

// OMR Output Schema
export const OmrResultSchema = z.object({
    status: z.nativeEnum(OmrStatus),
    studentId: z.string().optional(),
    studentName: z.string().optional(),
    answers: z.array(AnswerSchema),
    rawScore: z.number().optional(),
    processingTimeMs: z.number(),
    metadata: z.record(z.any()).optional(),
    error: z.string().optional()
});

export type OmrResult = z.infer<typeof OmrResultSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Point = z.infer<typeof PointSchema>;
export type Box = z.infer<typeof BoxSchema>;

// OMR Input Context
export interface OmrContext {
    imageUrl: string;
    templateId: string;
    examId?: string;
    options?: {
        debug?: boolean;
        detectOrientation?: boolean;
    };
}

// Provider Interface
export interface IOmrProvider {
    process(context: OmrContext): Promise<OmrResult>;
    name: string;
}
