'use client'

import { useState } from 'react'
import { Card } from '@repo/ui/card'
import { Button } from '@repo/ui/button'
import { ResumeDropzone } from '../components/ResumeDropzone'
import { useServerHealth } from '../hooks/useServerHealth'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'features' | 'status'>('upload')

  // Live polling check for Bun + Hono API server
  const { data: apiStatus, isLoading: isApiLoading, isError: isApiError, refetch } = useServerHealth()

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Light Mode Grid Background */}
      <div className="absolute inset-0 bg-grid-light opacity-80 pointer-events-none" />

      {/* Modern Animated Gradient Mesh Blobs */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-indigo-200/50 via-purple-100/40 to-blue-200/50 blur-3xl pointer-events-none rounded-full mask-spotlight animate-float" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/30 via-indigo-100/30 to-slate-200/30 blur-3xl pointer-events-none rounded-full animate-float-delayed" />
      <div className="absolute top-[20%] right-[-150px] w-[500px] h-[500px] bg-gradient-to-bl from-violet-200/40 via-indigo-100/30 to-transparent blur-3xl pointer-events-none rounded-full animate-float" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-600/30">
            T
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Talent<span className="text-indigo-600">Lens</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Scan Resume
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            System Status
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600">
              & Resume Ingestion
            </span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Upload candidate resumes directly to MinIO Object Storage via S3 Presigned URLs, verified instantaneously by Hono API backend.
          </p>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'upload' && (
          <div className="w-full flex justify-center">
            <ResumeDropzone />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            <Card
              title="Presigned S3 Direct Upload"
              description="Zero server memory overhead. Frontend streams binaries directly to MinIO bucket via S3 presigned URLs."
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              }
            />

            <Card
              title="Verification & Metadata API"
              description="Post-upload verification API checks file presence in storage and records candidate form metadata."
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <Card
              title="Zod Schema Validation"
              description="Strict MIME type checking (.pdf, .docx) and file size limits (max 10MB) enforced before upload."
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="w-full max-w-xl bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-7 shadow-sm text-left">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <span className="text-sm font-bold text-slate-800">API Health Diagnostics</span>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                Re-check API
              </Button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Service:</span>
                <span className="text-indigo-600 font-bold">{apiStatus?.service || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-600 font-bold">{apiStatus?.status || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{apiStatus?.timestamp || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">API Base:</span>
                <span className="text-slate-700">http://localhost:8000</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>TalentLens Platform © 2026 • Turborepo & Bun Architecture</div>
        <div className="flex items-center gap-6 mt-3 sm:mt-0 font-medium">
          <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Next.js</a>
          <a href="https://hono.dev" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Hono</a>
          <a href="https://min.io" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">MinIO</a>
          <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Tailwind CSS</a>
        </div>
      </footer>
    </div>
  )
}
