'use client'

import { useState } from 'react'
import { LandingPage } from '../components/LandingPage'
import { Dashboard } from '../components/Dashboard'

export default function Home() {
  // Temporary toggle to let you preview the new UI without uploading a PDF
  const [showDashboard, setShowDashboard] = useState(true)

  if (showDashboard) {
    return <Dashboard onReset={() => setShowDashboard(false)} />
  }

  return (
    <div className="relative">
      {/* Development Preview Toggle */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setShowDashboard(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg cursor-pointer hover:bg-indigo-700"
        >
          Preview Dashboard UI
        </button>
      </div>
      <LandingPage />
    </div>
  )
}
