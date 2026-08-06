import { Hono } from "hono";
import { getPresignedPutUrl, verifyObjectExists } from "../lib/s3";
import { z } from "zod";
import { validateJson } from "../lib/validator";
import { sendError, sendSuccess } from "../lib/apiResponse";

export const uploadRouter = new Hono()

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
] as const

const presignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(ALLOWED_FILE_TYPES, { error: 'Invalid file type. Only PDF (.pdf) and Word documents (.docx, .doc) are allowed' }),
  fileSize: z.number().refine((val) => val > 0 && val <= 10 * 1024 * 1024, 'File size must be greater than 0 and less than 10MB'),
})

const completeUploadSchema = z.object({
  fileId: z.uuid('Invalid file ID format'),
  objectKey: z.string().min(1, 'Object key is required'),
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

    console.log(`Upload completed: ${body.objectKey} for candidate ${body.metadata?.candidateName || 'unknown'}`)
    return sendSuccess({
        c,
        data: {
            fileId: body.fileId
        },
        message: 'Upload completed successfully',
        statusCode: 200
    })
})