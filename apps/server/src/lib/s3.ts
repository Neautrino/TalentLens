import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000'
const region = process.env.MINIO_REGION || 'us-east-1'
const accessKeyId = process.env.MINIO_ACCESS_KEY || 'minioadmin'
const secretAccessKey = process.env.MINIO_SECRET_KEY || 'minioadmin'

export const bucketName = process.env.MINIO_BUCKET_NAME || 'talentlens-uploads'

export const s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: true
})

export async function getPresignedPutUrl(objectKey: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
    })

    return getSignedUrl(s3Client, command, {expiresIn: 900})
}

export async function verifyObjectExists(objectKey: string) {
    try{
        const command = new HeadObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        })
        await s3Client.send(command)    
        console.log('Object exists')
        return true
    } catch ( error ) {
        if (error instanceof Error && 'name' in error) {
            if (error.name === 'NotFound') {
                console.log('Object does not exist')
                return false
            }
        }
        console.error('Error verifying object exists: ', error)
        throw error
    }
}