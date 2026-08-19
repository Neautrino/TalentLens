import { AnalysisResult } from "../analyzer/engine"

export interface FileRecord {
    fileId: string
    userId: string
    version?: number
    objectKey: string
    fileName: string
    fileType: string
    fileSize: number
    uploadedAt: string
    status: 'pending' | 'completed' | 'parsing' | 'parsed' | 'failed'
    rawText?: string
    parsedData?: {
        name?: string | null
        email?: string | null
        phone?: string | null
    }
    analysisResult?: AnalysisResult
}

export interface JobRecord {
    jobId: string
    userId: string
    content: string
    updatedAt: string
}

export const fileStore = new Map<string, FileRecord>()
export const jobStore = new Map<string, JobRecord>()
const version = 0;

export const getFileRecord = (fileId: string): FileRecord | undefined => {
    return fileStore.get(fileId)
}

export const setFileRecord = (fileRecord: FileRecord) => {
  const existing = fileStore.get(fileRecord.fileId)
  if (existing) {
    fileStore.set(fileRecord.fileId, fileRecord)
  } else {
    const userFilesCount = Array.from(fileStore.values()).filter(
      (f) => f.userId === fileRecord.userId
    ).length
    fileStore.set(fileRecord.fileId, {
      ...fileRecord,
      version: userFilesCount + 1,
    })
  }
}

export const deleteFileRecord = (fileId: string) => {
    fileStore.delete(fileId)
}

export const getActiveJobRecord = (userId: string): JobRecord | undefined => {
    return jobStore.get(userId)
}

export const setActiveJobRecord = (userId: string, content: string): JobRecord => {
    const existing = jobStore.get(userId)
    const record: JobRecord = {
        jobId: existing ? existing.jobId : crypto.randomUUID(),
        userId,
        content,
        updatedAt: new Date().toISOString(),
    }
    jobStore.set(userId, record)
    return record
}

export const deleteJobRecord = (userId: string) => {
    jobStore.delete(userId)
}