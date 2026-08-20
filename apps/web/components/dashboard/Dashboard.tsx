import React from 'react'
import { Button } from '../ui/button'

interface DashboardProps {
  onReset?: () => void
}

export function Dashboard({ onReset }: DashboardProps) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100 font-sans">
      
      {/* Edge-to-Edge Top Navigation */}
      <header className="h-[65px] w-full px-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 z-20">
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
        <div className="w-[450px] shrink-0 bg-white border-r border-slate-200 h-full overflow-y-auto custom-scrollbar flex flex-col z-10">
          <div className="p-8 space-y-8">
            
            {/* Overall Score Dial */}
            <div className="flex flex-col items-center justify-center pt-4">
              <div className="w-32 h-32 rounded-full border-[8px] border-emerald-400 flex items-center justify-center mb-4 shadow-inner bg-slate-50">
                <span className="text-5xl font-black text-slate-800 tracking-tighter">74</span>
              </div>
              <span className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Overall Score</span>
            </div>

            <hr className="border-slate-100" />

            {/* Category Scores */}
            <div className="space-y-5">
              <h3 className="font-extrabold text-slate-800 text-lg">Category Scores</h3>
              {[
                { name: 'Impact', score: 6.5, color: 'bg-amber-400' },
                { name: 'Brevity', score: 9.0, color: 'bg-emerald-400' },
                { name: 'Style', score: 4.5, color: 'bg-rose-400' },
                { name: 'ATS Compatibility', score: 10.0, color: 'bg-emerald-400' }
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
                
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm transition-colors hover:bg-rose-100/50 cursor-pointer">
                  <span className="font-bold text-rose-700 block mb-1.5 text-xs uppercase tracking-wide">Weak Verb Detected</span>
                  <span className="text-slate-700 leading-relaxed">
                    You used the phrase <span className="font-bold text-rose-800 bg-rose-200/50 px-1 rounded">"Helped with"</span>. Replace it with a strong action verb like "Architected" or "Spearheaded".
                  </span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm transition-colors hover:bg-amber-100/50 cursor-pointer">
                  <span className="font-bold text-amber-700 block mb-1.5 text-xs uppercase tracking-wide">Missing Metric</span>
                  <span className="text-slate-700 leading-relaxed">
                    Bullet point lacks numbers. Quantify your achievement to improve your impact score.
                  </span>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm transition-colors hover:bg-indigo-100/50 cursor-pointer">
                  <span className="font-bold text-indigo-700 block mb-1.5 text-xs uppercase tracking-wide">Buzzword</span>
                  <span className="text-slate-700 leading-relaxed">
                    Remove vague buzzword <span className="font-bold text-indigo-800 bg-indigo-200/50 px-1 rounded">"dynamic"</span>.
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT MAIN AREA: Resume HTML Viewer       */}
        {/* ========================================= */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative flex flex-col">
          
          {/* Context Bar */}
          <div className="w-full bg-slate-200/50 border-b border-slate-200 px-8 py-3 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              ATS Parsed Text View
            </span>
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold">Interactive Mode</span>
          </div>

          {/* The "Paper" Container */}
          <div className="p-8 pb-20 w-full flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-2xl border border-slate-200 min-h-[1056px] p-12 sm:p-16 text-slate-800 font-serif leading-relaxed text-[15px]">
              
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight font-sans">SUBHENDU SINGH</h1>
                <p className="text-sm font-sans font-medium text-slate-600 space-x-3">
                  <span>+91 9907089230</span>
                  <span>•</span> 
                  <span>ssubhendu988@gmail.com</span>
                  <span>•</span> 
                  <span className="text-indigo-600 hover:underline cursor-pointer">linkedin.com/in/isubhendu</span>
                </p>
              </div>

              {/* Experience Section */}
              <div className="mb-10">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 mb-4 pb-1 uppercase tracking-wider font-sans">Experience</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between font-bold text-slate-900 text-md font-sans">
                    <span>Software Development Engineer I (Backend Lead)</span>
                    <span className="text-sm text-slate-500">Sep 2025 - Present</span>
                  </div>
                  <div className="text-slate-600 font-sans font-medium text-sm mb-3 mt-1">Quantumcona LLP (Paymorz) — Hyderabad, India</div>
                  
                  <ul className="list-disc pl-6 space-y-3 font-sans">
                    <li>
                      Built and scaled a real-money fintech payment platform backend on Django + Supabase as the sole backend engineer, re-architecting a tightly-coupled codebase into an event-driven modular monolith and <span className="bg-emerald-100 text-emerald-900 px-1 rounded font-semibold border-b border-emerald-300">reducing system errors by ~60%</span>.
                    </li>
                    <li className="relative group">
                      <span className="bg-rose-200/80 text-rose-900 px-1 rounded border-b-2 border-rose-500 font-bold cursor-help transition-colors hover:bg-rose-300">
                        Helped with
                      </span>
                      {/* Tooltip */}
                      <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 font-sans leading-relaxed">
                        <span className="font-bold text-rose-400 block mb-1 text-sm">Weak Verb</span>
                        Replace this with a strong action verb (e.g., 'Architected', 'Spearheaded').
                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 transform rotate-45" />
                      </div>
                      {' '}the integration of Razorpay and Apple IAP with webhook handling and daily settlement reconciliation.
                    </li>
                    <li>
                      Delivered subscriptions with promo codes, KYC (PAN/Aadhaar/GST), and automated invoice PDFs on GCS.
                    </li>
                    <li className="relative group">
                      Built a{' '}
                      <span className="bg-indigo-200/80 text-indigo-900 px-1 rounded border-b-2 border-indigo-500 font-bold cursor-help transition-colors hover:bg-indigo-300">
                        dynamic
                      </span>
                      {/* Tooltip */}
                      <div className="absolute hidden group-hover:block bottom-full left-10 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 font-sans leading-relaxed">
                        <span className="font-bold text-indigo-400 block mb-1 text-sm">Buzzword / Cliché</span>
                        "Dynamic" is a vague buzzword. Replace it with a specific technical term.
                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 transform rotate-45" />
                      </div>
                      {' '}schema system for category listing forms, plus review/rating and multipart file upload.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Education Section */}
              <div className="mb-10">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 mb-4 pb-1 uppercase tracking-wider font-sans">Education</h2>
                <div className="flex justify-between font-bold text-slate-900 text-md font-sans">
                  <span>Bengal College of Engineering and Technology</span>
                  <span className="text-sm text-slate-500">July 2021 - July 2025</span>
                </div>
                <div className="text-slate-600 font-sans font-medium text-sm mt-1">Bachelor of Technology - Information Technology; CGPA: 8.51</div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
