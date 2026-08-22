import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"

export interface ParsedResumeResult {
    rawText: string
    pageCount: number | null
    pages: string[]
    // Real link targets. Extracted text carries only the visible label, so a
    // resume showing "Portfolio" hides the actual href.
    hyperlinks: Array<{ text: string; url: string }>
    metadata?: {
        name?: string | null
        email?: string | null
        phone?: string | null
    }
}

function dedupeLinks(links: Array<{ text: string; url: string }>) {
    const seen = new Map<string, { text: string; url: string }>()
    for (const link of links) {
        if (!link?.url) continue
        if (!seen.has(link.url)) seen.set(link.url, { text: link.text?.trim() ?? "", url: link.url })
    }
    return [...seen.values()]
}

export async function extractTextFromBuffer(buffer:Buffer, fileType: string): Promise<ParsedResumeResult> {
    if(fileType.toLowerCase() === "application/pdf") {
        const uint8Array = new Uint8Array(buffer)
        const parser = new PDFParse(uint8Array)
        const pdfData = await parser.getText()

        // Link annotations live outside the text layer. A failure here must
        // not lose the text we already have.
        let hyperlinks: Array<{ text: string; url: string }> = []
        try {
            const info = await parser.getInfo({ parsePageInfo: true })
            hyperlinks = dedupeLinks((info.pages ?? []).flatMap(page => page.links ?? []))
        } catch (error) {
            console.error('[Parser] Could not read hyperlinks:', error)
        }

        return {
            rawText: pdfData.text,
            pageCount: pdfData.total,
            pages: pdfData.pages.map(page => page.text),
            hyperlinks
        }
    } else if (fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType.toLowerCase() === 'application/msword') {
        const docResult = await mammoth.extractRawText({buffer})
        return { rawText: docResult.value, pageCount: null, pages: [], hyperlinks: [] }
    } else {
        console.error(`[Parser] Unsupported file type encountered: "${fileType}"`)
        throw new Error(`Unsupported file type for parsing: ${fileType}`)
    }
}

export function extractBasicInfo(text: string) {
    const nameMatch = text.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/)
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)

    const info = {
        name: nameMatch?.[0] || null,
        email: emailMatch?.[0] || null,
        phone: phoneMatch?.[0] || null
    }

    console.log(`[Parser] Extracted info:`, info)
    return info
}
