import React from 'react'

interface NavProps {
  activeTab: 'upload' | 'features' | 'status'
  setActiveTab: (tab: 'upload' | 'features' | 'status') => void
}

export function Nav({ activeTab, setActiveTab }: NavProps) {
  return (
    <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-600/30">
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
  )
}
