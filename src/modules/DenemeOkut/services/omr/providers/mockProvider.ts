import { z } from 'zod';
import { IOmrProvider, OmrContext, OmrResult, OmrStatus, Answer } from '../schema';

export default class MockOmrProvider implements IOmrProvider {
    name = 'mock-v1';

    async process(context: OmrContext): Promise<OmrResult> {
        const start = performance.now();
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work

        // Deterministic seed based on Template ID or Exam ID
        // Simple hash to toggle success/fail or specific answers
        const seed = (context.templateId || 'default').length + (context.examId?.length || 0);
        const success = seed % 10 !== 0; // 90% success rate

        if (!success) {
            return {
                status: OmrStatus.FAILED,
                answers: [],
                processingTimeMs: performance.now() - start,
                error: 'Failed to align template markers.'
            };
        }

        // Mock answers A-E
        const options = ['A', 'B', 'C', 'D', 'E'];
        const totalQuestions = 20; // Default mock count
        const answers: Answer[] = [];

        for (let i = 0; i < totalQuestions; i++) {
            // Deterministic "random" logic
            const pseudoRand = (i * 7 + seed) % 13;

            let marked: string | null = null;
            let conf = 0.95;

            if (pseudoRand < 10) {
                marked = options[pseudoRand % 5]; // Valid answer
            } else if (pseudoRand === 10) {
                marked = null; // Blank
                conf = 0.8;
            } else {
                // Double mark or smudge simulated as low confidence or specific logic if we wanted
                marked = options[0]; // Just mark A
                conf = 0.4; // Low confidence
            }

            answers.push({
                questionIndex: i + 1,
                markedOption: marked,
                confidence: conf,
                box: { x: 100, y: 200 + i * 20, width: 30, height: 15 } // Mock coords
            });
        }

        // Attempt to extract Student ID from "QR" logic mock
        const studentId = `STD-${seed}-${Date.now().toString().slice(-4)}`;

        return {
            status: OmrStatus.SUCCESS,
            studentId,
            studentName: 'Mock Student Generator',
            answers,
            rawScore: answers.filter(a => a.confidence > 0.8).length * 5, // Dummy score
            processingTimeMs: performance.now() - start,
            metadata: { provider: this.name, seed }
        };
    }
}
