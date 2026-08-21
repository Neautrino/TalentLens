import { Hono } from "hono";
import { getObjectBuffer, getPresignedPutUrl, verifyObjectExists } from "../lib/s3";
import { z } from "zod";
import { validateJson } from "../lib/validator";
import { sendError, sendSuccess } from "../lib/apiResponse";
import { FileRecord, getFileRecord, setActiveJobRecord, setFileRecord } from "../store/store";
import { extractBasicInfo, extractTextFromBuffer } from "../lib/parser";
import { analyzeResume } from "../analyzer/engine";
import { analyzeLength } from "../analyzer/length";
import { analyzeResumeWithAgent, toAiAnalysis } from "../agents/analyzer/agent";
export const uploadRouter = new Hono()

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
] as const

const presignedUrlSchema = z.object({
  userId: z.string({ error: 'User ID is required' }).min(1, 'User ID cannot be empty'),
  fileName: z.string({ error: 'File name is required' }).min(1, 'File name cannot be empty'),
  jobDescription: z.string().optional(),
  fileType: z.enum(ALLOWED_FILE_TYPES, {
    error: 'Invalid file type. Only PDF (.pdf) and Word documents (.docx, .doc) are allowed',
  }),
  fileSize: z.number({ error: 'File size is required' }).refine((val) => val > 0 && val <= 10 * 1024 * 1024, 'File size must be greater than 0 and less than 10MB'),
})

const completeUploadSchema = z.object({
  userId: z.string({ error: 'User ID is required' }).min(1, 'User ID cannot be empty'),
  fileId: z.string({ error: 'File ID is required' }).uuid('Invalid file ID format'),
  objectKey: z.string({ error: 'Object key is required' }).min(1, 'Object key cannot be empty'),
  metadata: z
    .object({
      title: z.string().optional(),
      candidateName: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
})

uploadRouter.post("/presigned-url", validateJson(presignedUrlSchema), async(c) => {
    const body = c.req.valid('json')

    const fileId = crypto.randomUUID()
    const sanitizedFileName = body.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const objectKey = `uploads/${fileId}-${sanitizedFileName}`

    const presignedUrl = await getPresignedPutUrl(objectKey, body.fileType)

    const record:FileRecord = {
        fileId,
        userId: body.userId,
        objectKey,
        fileName: body.fileName,
        fileType: body.fileType,
        fileSize: body.fileSize,
        uploadedAt: new Date().toISOString(),
        status: 'pending'
    }

    setFileRecord(record)

    if(body.jobDescription){
        setActiveJobRecord(body.userId, body.jobDescription)
    }

    return sendSuccess({
        c, 
        data: {   
            fileId,
            objectKey,
            presignedUrl
        },
        message: "Presigned url generated successfully",
        statusCode: 200
    })
})

uploadRouter.post('/complete', validateJson(completeUploadSchema), async (c) => {
    const body = c.req.valid('json')

    try{
        const exists = await verifyObjectExists(body.objectKey)
        if(!exists){
            return sendError({
                c,
                message: 'File not found in storage',
                statusCode: 404
            })        
        }
    } catch(error) {
        console.error(`Error while verifying upload`, error)
        return sendError({
            c,
            message: 'Internal Server Error',
            statusCode: 500
        })        
    }

    const record = getFileRecord(body.fileId)
    if (!record) {
      return sendError({
        c,
        message: 'Upload record not found',
        statusCode: 404
      })
    }

    record.status = 'completed'
    setFileRecord(record)

    console.log(`Upload completed: ${body.objectKey} for candidate ${body.metadata?.candidateName || 'unknown'}`)

    try {
        const buffer = await getObjectBuffer(body.objectKey)
        const parsed = await extractTextFromBuffer(buffer, record.fileType)
        const rawText = parsed.rawText
        const parsedData = extractBasicInfo(rawText)
        const analysisResult = analyzeResume(rawText);

        console.log('[Length]', analyzeLength(parsed))

        record.rawText = rawText
        record.parsedData = parsedData
        record.analysisResult = analysisResult
        record.status = 'parsed'

        setFileRecord(record)

        const agentResult = await analyzeResumeWithAgent({ rawText, hyperlinks: parsed.hyperlinks })
        record.aiAnalysis = toAiAnalysis(agentResult)
        setFileRecord(record)
    } catch (error) {
        console.error(`Parsing failed for ${body.fileId}:`, error)
        record.status = 'failed'
        setFileRecord(record)
    }

    return sendSuccess({
        c,
        data: {
            fileId: body.fileId,
            fileName: record.fileName,
            parsedData: record.parsedData,
            analysis: record.analysisResult,
            aiAnalysis: record.aiAnalysis
        },
        message: 'Upload completed successfully',
        statusCode: 200
    })
})

uploadRouter.get('/analysis/:fileId', async (c) => {
    const fileId = c.req.param('fileId')
    const record = getFileRecord(fileId)

    if(!record) {
        return sendError({
            c,
            message: 'File record not found',
            statusCode: 404
        })
    }

    if(!record.analysisResult) {
        return sendError({
            c,
            message: "Analysis result not available yet for this file",
            statusCode: 400
        });
    }

    return sendSuccess({
        c,
        data: {
            fileId: record.fileId,
            fileName: record.fileName,
            parsedData: record.parsedData,
            analysis: record.analysisResult,
            aiAnalysis: record.aiAnalysis
        },
        message: 'Analysis retrieved successfully',
        statusCode: 200
    })
})

