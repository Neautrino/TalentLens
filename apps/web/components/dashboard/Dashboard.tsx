import React from 'react'
import { Button } from '../ui/button'
import dynamic from 'next/dynamic'

// Dynamically import the PDF viewer and disable Server-Side Rendering (SSR)
// because react-pdf requires browser APIs like DOMMatrix that don't exist on the server.
const PdfViewer = dynamic(() => import('./PdfViewer').then(mod => mod.PdfViewer), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col items-center justify-center text-slate-400">
      <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="font-semibold text-slate-500">Loading PDF Engine...</p>
    </div>
  )
})

interface DashboardProps {
  analysisData?: any
  pdfUrl?: string
  onReset?: () => void
}

export function Dashboard({ analysisData, pdfUrl, onReset }: DashboardProps) {
  const analysis = analysisData?.analysis || null;
  
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100 font-sans">
      
      {/* Edge-to-Edge Top Navigation */}
      <header className="h-16.25 w-full px-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm">
            T
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Talent<span className="text-indigo-600">Lens</span>
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="font-bold text-slate-600 cursor-pointer">
          Scan New Resume
        </Button>
      </header>

      {/* Full Screen Split Layout */}
      <main className="flex-1 flex overflow-hidden w-full">
        
        {/* ========================================= */}
        {/* LEFT SIDEBAR: Fixed width, flush to edges */}
        {/* ========================================= */}
        <div className="w-112.5 shrink-0 bg-white border-r border-slate-200 h-full overflow-y-auto custom-scrollbar flex flex-col z-10">
          <div className="p-8 space-y-8">
            
            {/* Overall Score Dial */}
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="w-32 h-32 rounded-full border-[8px] border-emerald-400 flex items-center justify-center mb-4 shadow-inner bg-slate-50">
                <span className="text-5xl font-black text-slate-800 tracking-tighter">{analysis?.overallScore || 0}</span>
              </div>
              <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Overall Score</span>
            </div>

            <hr className="border-slate-100" />

            {/* Category Scores */}
            <div className="space-y-5">
              <h3 className="font-extrabold text-slate-800 text-lg">Category Scores</h3>
              {[
                { name: 'Impact', score: analysis?.categoryScores?.impact || 0, color: 'bg-amber-400' },
                { name: 'Brevity', score: analysis?.categoryScores?.brevity || 0, color: 'bg-emerald-400' },
                { name: 'Style', score: analysis?.categoryScores?.style || 0, color: 'bg-rose-400' },
                { name: 'ATS Compatibility', score: analysis?.categoryScores?.ats || 0, color: 'bg-emerald-400' }
              ].map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="text-slate-600 uppercase tracking-wider">{cat.name}</span>
                    <span className="text-slate-900">{cat.score}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${(cat.score / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-slate-100" />

            {/* Top Fixes List */}
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-lg mb-5">Top Fixes</h3>
              <div className="space-y-4">
                {analysis?.issues?.high?.map((issue: any, i: number) => (
                  <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm transition-colors hover:bg-rose-100/50 cursor-pointer">
                    <span className="font-bold text-rose-700 block mb-1.5 text-xs uppercase tracking-wide">{issue.type.replace(/_/g, ' ')}</span>
                    <span className="text-slate-700 leading-relaxed">
                      {issue.message} <span className="font-bold text-rose-800 bg-rose-200/50 px-1 rounded">"{issue.word || issue.context.substring(0,20) + '...'}"</span>. {issue.suggestedFix}
                    </span>
                  </div>
                ))}

                {analysis?.issues?.medium?.map((issue: any, i: number) => (
                  <div key={i} className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm transition-colors hover:bg-amber-100/50 cursor-pointer">
                    <span className="font-bold text-amber-700 block mb-1.5 text-xs uppercase tracking-wide">{issue.type.replace(/_/g, ' ')}</span>
                    <span className="text-slate-700 leading-relaxed">
                      {issue.message} <span className="font-bold text-amber-800 bg-amber-200/50 px-1 rounded">"{issue.word || issue.context.substring(0,20) + '...'}"</span>. {issue.suggestedFix}
                    </span>
                  </div>
                ))}

                {(!analysis?.issues?.high?.length && !analysis?.issues?.medium?.length) && (
                   <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm">
                    <span className="font-bold text-emerald-700 block mb-1.5 text-xs uppercase tracking-wide">Looking Good</span>
                    <span className="text-slate-700 leading-relaxed">No high or medium priority issues found!</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT MAIN AREA: Actual PDF Viewer        */}
        {/* ========================================= */}
        <div className="flex-1 h-full overflow-hidden bg-slate-200/60 relative flex flex-col">
          
          {/* Context Bar */}
          <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Original Document
            </span>
          </div>

          {/* The Actual Highlighted PDF Viewer */}
          <div className="flex-1 w-full h-full p-4 sm:p-8 pb-20 flex justify-center overflow-y-auto">
            {pdfUrl ? (
              <PdfViewer fileUrl={pdfUrl} issues={analysis?.issues} />
            ) : (
              <div className="w-full max-w-4xl h-[calc(100vh-140px)] flex flex-col items-center justify-center text-slate-400 bg-white shadow-xl border border-slate-200 rounded-xl">
                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-semibold text-slate-500">PDF Viewer Placeholder</p>
                <p className="text-xs mt-2 text-slate-400 max-w-sm text-center">
                  Upload a resume to see the live document.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
