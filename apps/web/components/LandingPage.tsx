'use client'

import { useState } from 'react'
import { useServerHealth } from '../hooks/useServerHealth'

// Landing Page Components
import { Nav } from './landing/Nav'
import { Hero } from './landing/Hero'
import { UploadSection } from './landing/UploadSection'
import { FeaturesSection } from './landing/FeaturesSection'
import { StatusSection } from './landing/StatusSection'
import { Footer } from './landing/Footer'

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'features' | 'status'>('upload')
  const { data: apiStatus, isLoading: isApiLoading, isError: isApiError, refetch } = useServerHealth()

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Light Mode Grid Background */}
      <div className="absolute inset-0 bg-grid-light opacity-80 pointer-events-none" />

      {/* Modern Animated Gradient Mesh Blobs */}
      <div className="absolute -top-25 left-1/2 -translate-x-1/2 w-225 h-125 bg-linear-to-tr from-indigo-200/50 via-purple-100/40 to-blue-200/50 blur-3xl pointer-events-none rounded-full mask-spotlight animate-float" />
      <div className="absolute -bottom-37.5 -left-25 w-150 h-150 bg-linear-to-tr from-blue-200/30 via-indigo-100/30 to-slate-200/30 blur-3xl pointer-events-none rounded-full animate-float-delayed" />
      <div className="absolute top-[20%] -right-37.5 w-125 h-125 bg-linear-to-bl from-violet-200/40 via-indigo-100/30 to-transparent blur-3xl pointer-events-none rounded-full animate-float" />

      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
        <Hero 
          isApiLoading={isApiLoading} 
          isApiError={isApiError} 
          apiStatus={apiStatus} 
        />

        {activeTab === 'upload' && <UploadSection />}
        {activeTab === 'features' && <FeaturesSection />}
        {activeTab === 'status' && <StatusSection apiStatus={apiStatus} refetch={refetch} />}
      </main>

      <Footer />
    </div>
  )
}
