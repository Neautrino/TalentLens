import React, { useState } from 'react'
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
  const [activeCategory, setActiveCategory] = useState<string>('Impact')
  
  const allIssues = [
    ...(analysis?.issues?.high || []),
    ...(analysis?.issues?.medium || []),
    ...(analysis?.issues?.low || [])
  ];

  const CATEGORY_MAP: Record<string, string> = {
    "MISSING_METRIC": "Impact",
    "WEAK_VERB": "Impact",
    "BUZZWORD": "Style",
    "PERSONAL_PRONOUN": "Style",
    "REPETITION": "Style",
    "FILLER_WORD": "Brevity",
    "BULLET_TOO_LONG": "Brevity",
    "BULLET_TOO_SHORT": "Brevity",
    "MISSING_SECTION": "ATS Compatibility",
    "MISSING_CONTACT": "ATS Compatibility"
  };

  const availableCategories = Array.from(new Set(allIssues.map((issue: any) => CATEGORY_MAP[issue.type] || 'Other')));
  
  // If current category isn't available, default to the first one available
  if (allIssues.length > 0 && !availableCategories.includes(activeCategory)) {
    setActiveCategory(availableCategories[0] as string);
  }

  const activeIssues = allIssues.filter((issue: any) => CATEGORY_MAP[issue.type] === activeCategory);
  
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
        <div className="w-1/2 max-w-[800px] shrink-0 bg-white border-r border-slate-200 h-full overflow-y-auto custom-scrollbar flex flex-col z-10">
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
              <div className="flex flex-col gap-3 mb-5">
                <h3 className="font-extrabold text-slate-800 text-lg">Fixes by Category</h3>
                
                {/* Dynamic Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {availableCategories.length > 0 ? availableCategories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat as string)} 
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                        activeCategory === cat 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat as string}
                    </button>
                  )) : (
                    <span className="text-sm text-emerald-600 font-bold">No issues found!</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 pr-2">
                {activeIssues.length > 0 ? activeIssues.map((issue: any, i: number) => {
                  // Safely map Tailwind classes to avoid purge issues based on SEVERITY, not tab
                  const styles = {
                    HIGH: { bg: 'bg-rose-50', border: 'border-rose-100', hover: 'hover:bg-rose-100/50', text: 'text-rose-700', textBold: 'text-rose-800 bg-rose-200/50' },
                    MEDIUM: { bg: 'bg-amber-50', border: 'border-amber-100', hover: 'hover:bg-amber-100/50', text: 'text-amber-700', textBold: 'text-amber-800 bg-amber-200/50' },
                    LOW: { bg: 'bg-indigo-50', border: 'border-indigo-100', hover: 'hover:bg-indigo-100/50', text: 'text-indigo-700', textBold: 'text-indigo-800 bg-indigo-200/50' }
                  }[issue.severity as 'HIGH'|'MEDIUM'|'LOW'] || { bg: 'bg-indigo-50', border: 'border-indigo-100', hover: 'hover:bg-indigo-100/50', text: 'text-indigo-700', textBold: 'text-indigo-800 bg-indigo-200/50' };
                  
                  return (
                    <div key={i} className={`p-5 ${styles.bg} border ${styles.border} rounded-2xl text-sm transition-colors ${styles.hover} cursor-pointer`}>
                      <span className={`font-bold ${styles.text} block mb-2 text-xs uppercase tracking-wide`}>
                        {issue.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-700 leading-relaxed block break-words">
                        {issue.message} 
                        {issue.word && (
                          <> <span className={`font-bold ${styles.textBold} px-1 rounded`}>"{issue.word}"</span>.</>
                        )}
                        {issue.suggestedFix && ` ${issue.suggestedFix}`}
                      </span>
                    </div>
                  )
                }) : (
                  <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm">
                    <span className="font-bold text-emerald-700 block mb-1.5 text-xs uppercase tracking-wide">Looking Good</span>
                    <span className="text-slate-700 leading-relaxed">No issues in the {activeCategory} category!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT MAIN AREA: Actual PDF Viewer        */}
        {/* ========================================= */}
        <div className="w-1/2 flex-1 h-full overflow-hidden bg-slate-200/60 relative flex flex-col">
          
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
              <PdfViewer fileUrl={pdfUrl} activeHighlights={activeIssues} />
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
