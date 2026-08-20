'use client'

import { useState } from 'react'

interface ResumeAnalysisViewProps {
  file: File | null
  onReset: () => void
}

export function ResumeAnalysisView({ file, onReset }: ResumeAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'raw'>('details')
  const pdfUrl = file ? URL.createObjectURL(file) : null

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/90 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
            📄
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {file?.name || 'Resume Document'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type || 'PDF/DOCX'}` : 'Dummy File'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            ← Upload Another Resume
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Details, Right Resume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Analysis & Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Candidate Overview Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                Analysis Summary
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ready
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {file?.name.split('.')[0]?.replace(/[-_]/g, ' ') || 'John Doe'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Senior Full Stack Engineer</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Overall Score</p>
                <p className="text-2xl font-black text-indigo-600 mt-0.5">88/100</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Experience</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">5+ Yrs</p>
              </div>
            </div>
          </div>

          {/* Key Skills & Details Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>⚡</span> Detected Key Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'GraphQL'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-slate-100 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* AI Insights / Breakdown Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex border-b border-slate-100 pb-2 gap-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`text-xs font-bold pb-1 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Key Highlights
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`text-xs font-bold pb-1 transition-all cursor-pointer ${
                  activeTab === 'raw'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Raw Extraction
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-emerald-900">
                  <p className="font-semibold text-emerald-900 mb-0.5">Strong Frontend Experience</p>
                  Demonstrated mastery in modern React ecosystems and performance optimization.
                </div>
                <div className="p-3 bg-indigo-50/60 border border-indigo-200/70 rounded-xl text-indigo-900">
                  <p className="font-semibold text-indigo-900 mb-0.5">Backend & API Design</p>
                  Solid experience with Node.js microservices and database architecture.
                </div>
              </div>
            ) : (
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
{JSON.stringify(
  {
    candidate: file?.name || 'Dummy Resume',
    extractedAt: new Date().toISOString(),
    status: 'PARSED_SUCCESSFULLY',
  },
  null,
  2
)}
              </pre>
            )}
          </div>
        </div>

        {/* Right Side: Resume Viewer / Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 shadow-sm min-h-162.5 flex flex-col">
          <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100 mb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📄</span> Resume Preview
            </h4>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Open Original ↗
              </a>
            )}
          </div>

          <div className="flex-1 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 min-h-145 flex items-center justify-center">
            {pdfUrl && file?.type === 'application/pdf' ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full min-h-145"
                title="Resume PDF Preview"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 bg-slate-200/80 rounded-2xl flex items-center justify-center mx-auto text-2xl text-slate-500">
                  📑
                </div>
                <h5 className="font-bold text-slate-800 text-sm">
                  {file?.name || 'Document Preview'}
                </h5>
                <p className="text-xs text-slate-500 max-w-sm">
                  {file?.type === 'application/pdf' || !file
                    ? 'PDF Preview will render here once uploaded.'
                    : 'Preview available natively for PDF files. Non-PDF files (e.g. DOCX) are extracted and displayed in the left breakdown section.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
