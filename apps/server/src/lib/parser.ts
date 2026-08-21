import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"

export interface ParsedResumeResult {
    rawText: string
    pageCount: number | null
    pages: string[]
    metadata?: {
        name?: string | null
        email?: string | null
        phone?: string | null
    }
}

export async function extractTextFromBuffer(buffer:Buffer, fileType: string): Promise<ParsedResumeResult> {
    if(fileType.toLowerCase() === "application/pdf") {
        const uint8Array = new Uint8Array(buffer)
        const pdfData = await new PDFParse(uint8Array).getText()
        return {
            rawText: pdfData.text,
            pageCount: pdfData.total,
            pages: pdfData.pages.map(page => page.text)
        }
    } else if (fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType.toLowerCase() === 'application/msword') {
        const docResult = await mammoth.extractRawText({buffer})
        return { rawText: docResult.value, pageCount: null, pages: [] }
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
