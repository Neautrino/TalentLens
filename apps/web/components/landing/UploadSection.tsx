import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFileUpload } from '../../hooks/useFileUpload'
import { Dropzone } from '../ui/dropzone'
import { useTalentStore } from '../../store/useTalentStore'

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc']
const MAX_FILE_SIZE_MB = 2

interface UploadSectionProps {
  onUploadSuccess?: (uploadedFile: File, responseData: any) => void
}

export function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const router = useRouter()
  const setResumeData = useTalentStore((state) => state.setResumeData)

  const [file, setFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { upload, isPending, step, progress, errorMessage, reset } = useFileUpload()

  const validateFile = (selectedFile: File | null): boolean => {
    setValidationError(null)
    
    if (!selectedFile) return false

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`File size exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB`)
      return false
    }

    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError('Invalid file type. Only PDF (.pdf) and Word (.docx, .doc) files are allowed.')
      return false
    }

    return true
  }

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    } else {
      setFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    try {
      const nameWithoutExt = file.name.split('.')[0]?.replace(/[-_]/g, ' ') || 'Candidate'
      const response = await upload({
        file,
        metadata: {
          title: file.name,
          candidateName: nameWithoutExt,
          tags: ['Resume'],
        },
      })
      if (onUploadSuccess) {
        onUploadSuccess(file, response)
      }
      // Save to global store and navigate to dashboard
      setResumeData(file, response.data)
      router.push('/dashboard')
    } catch {
      // Error handled by useFileUpload hook
    }
  }

  const handleResetAll = () => {
    setFile(null)
    setValidationError(null)
    reset()
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 shadow-xl shadow-indigo-500/5 transition-all duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Scan Resume Document</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Drop your candidate PDF or Word file to initiate AI processing.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100/80 text-indigo-600 text-xs font-bold rounded-xl shadow-2xs">
              PDF / DOCX
            </span>
          </div>

          <Dropzone 
            file={file}
            onFileSelect={handleFileSelect}
            isPending={isPending}
            accept=".pdf,.docx,.doc"
            title="Click to upload or drag & drop resume file"
            subtitle="Supports PDF or Word documents up to 10MB"
          />

          {(validationError || errorMessage) && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{validationError || errorMessage}</span>
            </div>
          )}

          {isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-600 capitalize">
                  {step === 'presigning' && 'Generating presigned URL...'}
                  {step === 'uploading' && `Uploading document (${progress}%)`}
                  {step === 'verifying' && 'Verifying upload with server...'}
                </span>
                <span className="text-slate-500 font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
                <div
                  className="bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!file || isPending}
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm tracking-wide text-white bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Scan</span>
                </>
              )}
            </button>
          </div>
        </form>
    </div>
  )
}
