'use client'

import { Button } from '@repo/ui/button'
import { Card } from '@repo/ui/card'
import { useState } from 'react'
import { useServerHealth } from '../hooks/useServerHealth'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'tech'>('overview')

  // Clean custom TanStack Query hook calling Bun + Hono API
  const { data: apiStatus, isLoading, isError, isFetching, refetch } = useServerHealth()

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
            T
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Talent<span className="text-indigo-400">Lens</span>
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'api'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            API Live Status
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tech'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Tech Stack
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl my-auto py-12 flex flex-col items-center text-center">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          Turborepo Monorepo • Next.js 16 • Bun + Hono • TanStack Query
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 mb-6 max-w-3xl leading-tight">
          Next-Generation Talent Intelligence <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
            Powered by Monorepo Architecture
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          High-performance fullstack architecture integrating shared type-safe packages, real-time query caching, and ultra-fast Bun server APIs.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Button variant="primary" size="lg" onClick={() => refetch()}>
            {isFetching ? 'Refreshing Server...' : 'Check Server Status'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open('https://turborepo.dev', '_blank')}
          >
            Turborepo Docs →
          </Button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left transition-all duration-300">
            <Card
              title="Next.js 16 App Router"
              description="Built with React 19, Server Components, and client-side TanStack Query Provider."
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />

            <Card
              title="Bun + Hono Backend"
              description="Ultra-fast TypeScript API server running on port 3001 with CORS middleware."
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            >
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">API Health:</span>
                {isLoading ? (
                  <span className="text-amber-400 font-mono">Fetching...</span>
                ) : isError ? (
                  <span className="text-rose-400 font-mono">Server Offline (Port 3001)</span>
                ) : (
                  <span className="text-emerald-400 font-mono font-bold">
                    {apiStatus?.service || 'Online'}
                  </span>
                )}
              </div>
            </Card>

            <Card
              title="Shared @repo Packages"
              description="Modular UI components, TypeScript bases, and ESLint configurations across all apps."
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
          </div>
        )}

        {/* Tab 2: API LIVE STATUS */}
        {activeTab === 'api' && (
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="text-sm font-semibold text-slate-200">
                Bun + Hono API Monitor (Port 3001)
              </span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400">
                GET /api/health
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
                Connecting to API server...
              </div>
            ) : isError ? (
              <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                ⚠️ Could not connect to API server at <code className="font-mono text-xs">http://localhost:3001</code>.
                Make sure to run <code className="font-mono text-xs">bun run dev</code>!
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="text-emerald-400 font-bold">{apiStatus?.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400">{apiStatus?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-300">{apiStatus?.timestamp}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: TECH STACK */}
        {activeTab === 'tech' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left">
            {[
              { name: 'Next.js 16', role: 'Frontend App', color: 'border-blue-500/30' },
              { name: 'Bun 1.3', role: 'Runtime & PM', color: 'border-amber-500/30' },
              { name: 'Hono 4', role: 'API Server', color: 'border-orange-500/30' },
              { name: 'Tailwind v4', role: 'PostCSS Styling', color: 'border-cyan-500/30' },
              { name: 'TanStack Query', role: 'Async State', color: 'border-rose-500/30' },
              { name: 'Turborepo', role: 'Build System', color: 'border-indigo-500/30' },
              { name: 'TypeScript 5', role: 'Shared Rules', color: 'border-blue-400/30' },
              { name: 'ESLint 9', role: 'Shared Flat Config', color: 'border-violet-500/30' },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`p-4 rounded-xl bg-slate-900/60 border ${tech.color} flex flex-col justify-between`}
              >
                <div className="font-bold text-white text-base">{tech.name}</div>
                <div className="text-slate-400 text-xs mt-1">{tech.role}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>TalentLens Monorepo Architecture © 2026</div>
        <div className="flex items-center gap-6 mt-3 sm:mt-0">
          <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Next.js</a>
          <a href="https://hono.dev" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Hono</a>
          <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">Tailwind CSS</a>
          <a href="https://tanstack.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">TanStack Query</a>
        </div>
      </footer>
    </div>
  )
}
