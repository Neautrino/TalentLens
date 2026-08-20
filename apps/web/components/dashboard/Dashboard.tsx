import React from 'react'
import { Button } from '../ui/button'

interface DashboardProps {
  onReset?: () => void
}

export function Dashboard({ onReset }: DashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full px-6 py-4 bg-white border-b border-slate-200/80 flex justify-between items-center z-10 relative shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm">
            T
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Talent<span className="text-indigo-600">Lens</span>
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="font-bold text-slate-600">
          Scan New Resume
        </Button>
      </header>

      {/* Split Layout Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-73px)]">
        
        {/* ========================================= */}
        {/* LEFT COLUMN: Scores & Fixes (4/12 width)  */}
        {/* ========================================= */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          {/* Overall Score Dial */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-1.5 bg-linear-to-r from-rose-500 via-amber-400 to-emerald-500" />
            <div className="w-32 h-32 rounded-full border-[6px] border-emerald-400 flex items-center justify-center mb-3 shadow-inner bg-slate-50">
              <span className="text-5xl font-black text-slate-800 tracking-tighter">74</span>
            </div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Overall Score</span>
          </div>

          {/* Category Scores */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-800 mb-2">Category Scores</h3>
            
            {[
              { name: 'Impact', score: 6.5, color: 'bg-amber-400' },
              { name: 'Brevity', score: 9.0, color: 'bg-emerald-400' },
              { name: 'Style', score: 4.5, color: 'bg-rose-400' },
              { name: 'ATS Compatibility', score: 10.0, color: 'bg-emerald-400' }
            ].map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-600 uppercase tracking-wider">{cat.name}</span>
                  <span className="text-slate-900">{cat.score}/10</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`${cat.color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${(cat.score / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top Fixes List */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1">
            <h3 className="font-extrabold text-slate-800 mb-4">Top Fixes</h3>
            <div className="space-y-3">
              
              <div className="p-3.5 bg-rose-50 border border-rose-100/80 rounded-2xl text-sm transition-colors hover:bg-rose-100/50 cursor-pointer">
                <span className="font-bold text-rose-700 block mb-1 text-xs uppercase tracking-wide">Weak Verb Detected</span>
                <span className="text-slate-600 leading-relaxed">
                  You used the phrase <span className="font-bold text-rose-800">"Helped with"</span>. Replace it with a strong action verb like "Architected" or "Spearheaded".
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-100/80 rounded-2xl text-sm transition-colors hover:bg-amber-100/50 cursor-pointer">
                <span className="font-bold text-amber-700 block mb-1 text-xs uppercase tracking-wide">Missing Metric</span>
                <span className="text-slate-600 leading-relaxed">
                  Bullet point lacks numbers. Quantify your achievement to improve your impact score.
                </span>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-100/80 rounded-2xl text-sm transition-colors hover:bg-indigo-100/50 cursor-pointer">
                <span className="font-bold text-indigo-700 block mb-1 text-xs uppercase tracking-wide">Buzzword</span>
                <span className="text-slate-600 leading-relaxed">
                  Remove vague buzzword <span className="font-bold text-indigo-800">"dynamic"</span>.
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: Resume Viewer (8/12 width)  */}
        {/* ========================================= */}
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl h-full overflow-y-auto relative">
          {/* Resume Viewer Header */}
          <div className="sticky top-0 w-full bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center z-20">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Viewer</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">ATS Parsed</span>
            </div>
          </div>

          {/* Dummy Resume Paper */}
          <div className="max-w-3xl mx-auto p-12 bg-white min-h-full font-serif text-slate-800">
            
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">SUBHENDU SINGH</h1>
              <p className="text-sm font-sans font-medium text-slate-600 space-x-3">
                <span>+91 9907089230</span>
                <span>•</span> 
                <span>ssubhendu988@gmail.com</span>
                <span>•</span> 
                <span className="text-indigo-600 hover:underline cursor-pointer">linkedin.com/in/isubhendu</span>
              </p>
            </div>

            {/* Experience Section */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 mb-4 pb-1 uppercase tracking-wider">Experience</h2>
              
              <div className="mb-6">
                <div className="flex justify-between font-bold text-slate-900 text-md">
                  <span>Software Development Engineer I (Backend Lead)</span>
                  <span className="font-sans text-sm">Sep 2025 - Present</span>
                </div>
                <div className="text-slate-600 font-sans font-medium text-sm mb-3 mt-1">Quantumcona LLP (Paymorz) — Hyderabad, India</div>
                
                <ul className="list-disc pl-6 space-y-2.5 text-sm font-sans leading-relaxed">
                  <li>
                    Built and scaled a real-money fintech payment platform backend on Django + Supabase as the sole backend engineer, re-architecting a tightly-coupled codebase into an event-driven modular monolith and <span className="bg-emerald-100 text-emerald-900 px-1 rounded border border-emerald-300 font-semibold">reducing system errors by ~60%</span>.
                  </li>
                  <li className="relative group">
                    <span className="bg-rose-200/80 text-rose-900 px-1 rounded border-b-2 border-rose-400 font-semibold cursor-help">
                      Helped with
                    </span>
                    {/* Tooltip */}
                    <div className="absolute hidden group-hover:block bottom-full left-0 mb-1 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 font-sans">
                      <span className="font-bold text-rose-400 block mb-1">Weak Verb</span>
                      Replace this with a strong action verb (e.g., 'Architected', 'Spearheaded').
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 transform rotate-45" />
                    </div>
                    {' '}the integration of Razorpay and Apple IAP with webhook handling and daily settlement reconciliation.
                  </li>
                  <li>
                    Delivered subscriptions with promo codes, KYC (PAN/Aadhaar/GST), and automated invoice PDFs on GCS.
                  </li>
                  <li className="relative group">
                    Built a{' '}
                    <span className="bg-indigo-200/80 text-indigo-900 px-1 rounded border-b-2 border-indigo-400 font-semibold cursor-help">
                      dynamic
                    </span>
                    {/* Tooltip */}
                    <div className="absolute hidden group-hover:block bottom-full left-10 mb-1 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 font-sans">
                      <span className="font-bold text-indigo-400 block mb-1">Buzzword / Cliché</span>
                      "Dynamic" is a vague buzzword. Replace it with a specific technical term.
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 transform rotate-45" />
                    </div>
                    {' '}schema system for category listing forms, plus review/rating and multipart file upload.
                  </li>
                </ul>
              </div>
            </div>

            {/* Education Section */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-300 mb-4 pb-1 uppercase tracking-wider">Education</h2>
              <div className="flex justify-between font-bold text-slate-900 text-md">
                <span>Bengal College of Engineering and Technology</span>
                <span className="font-sans text-sm">July 2021 - July 2025</span>
              </div>
              <div className="text-slate-600 font-sans font-medium text-sm mt-1">Bachelor of Technology - Information Technology; CGPA: 8.51</div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
