export interface PresignedUrlRequest {
  fileName: string
  fileType: string
  fileSize: number
}

export interface PresignedUrlData {
  fileId: string
  objectKey: string
  presignedUrl: string
}

export interface CompleteUploadRequest {
  fileId: string
  objectKey: string
  metadata?: {
    title?: string
    candidateName?: string
    tags?: string[]
  }
}

export interface CompleteUploadResponse {
  success: boolean
  message: string
  data: {
    fileId: string
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// 1. Request Presigned URL from Hono Server
export async function getPresignedUrl(
  params: PresignedUrlRequest
): Promise<PresignedUrlData> {
  const res = await fetch(`${API_BASE_URL}/api/upload/presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to request presigned upload URL')
  }

  return json.data
}

// 2. Direct binary upload to MinIO via presigned URL
export async function uploadToMinio(
  presignedUrl: string,
  file: File,
  onProgress?: (percentage: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('PUT', presignedUrl, true)
    xhr.setRequestHeader('Content-Type', file.type)

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Failed to upload file to storage (HTTP ${xhr.status})`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Network error occurred during MinIO upload'))
    }

    xhr.send(file)
  })
}

// 3. Complete Upload & Save Metadata
export async function completeUpload(
  params: CompleteUploadRequest
): Promise<CompleteUploadResponse> {
  const res = await fetch(`${API_BASE_URL}/api/upload/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to complete upload verification')
  }

  return json
}
