import { z } from 'zod';
import { IOmrProvider, OmrContext, OmrResult, OmrStatus } from './schema';
import MockOmrProvider from './providers/mockProvider';

export class OmrPipeline {
    private static instance: OmrPipeline;
    private currentProvider: IOmrProvider;

    private constructor() {
        // Default to mock for now, can swap via feature flag or config
        this.currentProvider = new MockOmrProvider();
    }

    static getInstance(): OmrPipeline {
        if (!OmrPipeline.instance) {
            OmrPipeline.instance = new OmrPipeline();
        }
        return OmrPipeline.instance;
    }

    async process(context: OmrContext): Promise<OmrResult> {
        try {
            console.log(`[OMR] Starting pipeline processing: ${context.templateId}`);
            if (!context.imageUrl) throw new Error('No image URL/data provided');

            // 1. Pre-checks (orientation, size, format?) - Future logic

            // 2. Delegate to active provider
            const result = await this.currentProvider.process(context);

            // 3. Post-Process / Normalization if needed
            if (result.status === OmrStatus.FAILED) {
                console.error(`[OMR] Processing failed: ${result.error}`);
            } else {
                console.log(`[OMR] Success! Score: ${result.rawScore || 0}, Answers: ${result.answers.length}`);
            }

            return result;

        } catch (err: any) {
            console.error('[OMR] Pipeline Critical Error:', err);
            // Fallback safe error response
            return {
                status: OmrStatus.FAILED,
                answers: [],
                processingTimeMs: 0,
                error: err.message || 'Unknown pipeline error'
            };
        }
    }

    // Allow switching providers at runtime if needed
    public setProvider(provider: IOmrProvider) {
        this.currentProvider = provider;
    }
}

export const omrService = OmrPipeline.getInstance();
