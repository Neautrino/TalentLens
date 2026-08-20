import React from 'react'

interface HeroProps {
  isApiLoading: boolean
  isApiError: boolean
  apiStatus: { service?: string } | null | undefined
}

export function Hero({ isApiLoading, isApiError, apiStatus }: HeroProps) {
  return (
    <>
      {/* Top Live Server Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 text-slate-600 text-xs font-semibold mb-6 shadow-xs backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isApiError ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isApiError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
        </span>
        {isApiLoading ? (
          'Connecting to Bun Server...'
        ) : isApiError ? (
          'Server Offline (Port 8000)'
        ) : (
          `Connected to ${apiStatus?.service || 'Bun Server'}`
        )}
      </div>

      {/* Hero Section Title */}
      <div className="text-center max-w-3xl mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
          Intelligent Candidate Management <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600">
            & Resume Ingestion
          </span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload candidate resumes directly to MinIO Object Storage via S3 Presigned URLs, verified instantaneously by Hono API backend.
        </p>
      </div>
    </>
  )
}
