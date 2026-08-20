import React from 'react'
import { Button } from '../ui/button'

interface StatusSectionProps {
  apiStatus: { 
    service?: string; 
    status?: string; 
    timestamp?: string; 
  } | null | undefined
  refetch: () => void
}
export function StatusSection({ apiStatus, refetch }: StatusSectionProps) {
  return (
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
          <span className="text-indigo-600 font-bold">{String(apiStatus?.service || 'N/A')}</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-500">Status:</span>
          <span className="text-emerald-600 font-bold">{String(apiStatus?.status || 'N/A')}</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-500">Timestamp:</span>
          <span className="text-slate-700">{String(apiStatus?.timestamp || 'N/A')}</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-slate-500">API Base:</span>
          <span className="text-slate-700">http://localhost:8000</span>
        </div>
      </div>
    </div>
  )
}
