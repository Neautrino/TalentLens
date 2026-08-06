import { Hono } from "hono";
import { bucketName, getPresignedPutUrl, verifyObjectExists } from "../lib/s3";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const uploadRouter = new Hono()

const presignedUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
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

uploadRouter.post("/presigned-url", zValidator('json', presignedUrlSchema), async(c) => {
    const body = c.req.valid('json')

    const fileId = crypto.randomUUID()
    const sanitizedFileName = body.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const objectKey = `uploads/${fileId}-${sanitizedFileName}`

    const presignedUrl = await getPresignedPutUrl(objectKey, body.fileType)

    return c.json({
        message: "Presigned url generated successfully",
        success: true,
        data: {
            fileId,
            objectKey,
            presignedUrl
        }
    }, 200)
})

uploadRouter.post('/complete', zValidator('json', completeUploadSchema), async (c) => {
    const body = c.req.valid('json')

    try{
        const exists = await verifyObjectExists(body.objectKey)
        if(!exists){
            return c.json({ error: 'File not found in storage' }, 404)        
        }
    } catch(error) {
        console.error(`Error while verifying upload`, error)
        return c.json({ error: 'Internal Server Error' }, 500)        
    }

    console.log(`Upload completed: ${body.objectKey} for candidate ${body.metadata?.candidateName || 'unknown'}`)
    return c.json({ success: true, message: 'Upload completed successfully' }, 200)
})