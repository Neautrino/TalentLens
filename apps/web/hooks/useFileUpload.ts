import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  getPresignedUrl,
  uploadToMinio,
  completeUpload,
  type CompleteUploadResponse,
} from '../lib/api/upload'

export type UploadStep =
  | 'idle'
  | 'presigning'
  | 'uploading'
  | 'verifying'
  | 'success'
  | 'error'

export interface UploadPayload {
  file: File
  metadata?: {
    title?: string
    candidateName?: string
    tags?: string[]
  }
}

export function useFileUpload() {
  const [step, setStep] = useState<UploadStep>('idle')
  const [progress, setProgress] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation<
    CompleteUploadResponse,
    Error,
    UploadPayload
  >({
    mutationFn: async ({ file, metadata }) => {
      setErrorMessage(null)
      setProgress(0)

      setStep('presigning')
      const presignData = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      setStep('uploading')
      await uploadToMinio(presignData.presignedUrl, file, (percent) => {
        setProgress(percent)
      })

      setStep('verifying')
      const completeRes = await completeUpload({
        fileId: presignData.fileId,
        objectKey: presignData.objectKey,
        metadata: {
          title: metadata?.title || file.name,
          candidateName: metadata?.candidateName || 'Anonymous Candidate',
          tags: metadata?.tags || ['Resume'],
        },
      })

      setStep('success')
      return completeRes
    },
    onError: (err) => {
      setStep('error')
      setErrorMessage(err.message || 'File upload failed')
    },
  })

  const reset = () => {
    setStep('idle')
    setProgress(0)
    setErrorMessage(null)
    mutation.reset()
  }

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    step,
    progress,
    errorMessage,
    reset,
  }
}
