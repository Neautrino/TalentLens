import * as React from 'react'

export interface DropzoneProps {
  file: File | null
  onFileSelect: (file: File | null) => void
  isPending?: boolean
  accept?: string
  title?: string
  subtitle?: string
}

export function Dropzone({
  file,
  onFileSelect,
  isPending = false,
  accept = "*",
  title = "Click to upload or drag & drop",
  subtitle = "Supported files"
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isPending && fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01] shadow-lg shadow-indigo-500/10'
          : file
            ? 'border-emerald-300 bg-emerald-50/30 shadow-sm'
            : 'border-slate-300/80 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50/80'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {file ? (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs uppercase shrink-0 shadow-2xs">
              {file.name.split('.').pop()}
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-bold text-slate-800 truncate">
                {file.name}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
          </div>
          {!isPending && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFileSelect(null)
              }}
              className="px-2.5 py-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-colors text-xs font-bold"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 py-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs transition-transform group-hover:scale-110">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-sm font-bold text-slate-700">
            {title}
          </div>
          <div className="text-xs text-slate-400">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  )
}
