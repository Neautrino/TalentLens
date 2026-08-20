import React from 'react'

export function Footer() {
  return (
    <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
      <div>TalentLens Platform © 2026 • Turborepo & Bun Architecture</div>
      <div className="flex items-center gap-6 mt-3 sm:mt-0 font-medium">
        <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Next.js</a>
        <a href="https://hono.dev" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Hono</a>
        <a href="https://min.io" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">MinIO</a>
        <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">Tailwind CSS</a>
      </div>
    </footer>
  )
}
