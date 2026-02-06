import { Template, TemplateSchema } from '../schemas'
import tr_meb_5choice_20q from '../templates/tr_meb_5choice_20q_v1.json'
import tr_meb_5choice_40q from '../templates/tr_meb_5choice_40q_v1.json'
import tr_meb_5choice_80q from '../templates/tr_meb_5choice_80q_v1.json'
import tr_meb_5choice_100q from '../templates/tr_meb_5choice_100q_v1.json'

// Raw imports (implicitly any/json)
const RAW_TEMPLATES = [
    tr_meb_5choice_20q,
    tr_meb_5choice_40q,
    tr_meb_5choice_80q,
    tr_meb_5choice_100q
]

class TemplateRegistry {
    private templates: Template[] = []

    constructor() {
        this.loadTemplates()
    }

    private loadTemplates() {
        const validTemplates: Template[] = []

        RAW_TEMPLATES.forEach((raw, index) => {
            const result = TemplateSchema.safeParse(raw)
            if (result.success) {
                validTemplates.push(result.data)
            } else {
                console.error(`[TemplateRegistry] Failed to load template at index ${index}:`, result.error.format())
            }
        })

        // Sort by question count for nice display
        this.templates = validTemplates.sort((a, b) => a.questionCount - b.questionCount)
        console.log(`[TemplateRegistry] Loaded ${this.templates.length} valid templates.`)
    }

    public getAllTemplates(): Template[] {
        return this.templates
    }

    public getTemplateById(templateId: string, version: number): Template | null {
        return this.templates.find(t => t.templateId === templateId && t.version === version) || null
    }
}

// Singleton export
export const templateRegistry = new TemplateRegistry()
