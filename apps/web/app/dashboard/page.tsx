'use client'

import { useEffect, useState } from 'react'
import { Dashboard } from '../../components/dashboard/Dashboard'
import { useRouter } from 'next/navigation'
import { useTalentStore } from '../../store/useTalentStore'

export default function DashboardPage() {
  const router = useRouter()
  const { analysisData, pdfFile, clearData } = useTalentStore()
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    // If user refreshes the page and memory is wiped, send them back to upload
    if (!analysisData) {
      router.push('/')
      return
    }

    // Generate local URL for the PDF viewer
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile)
      setPdfUrl(url)
      
      // Cleanup memory when component unmounts
      return () => URL.revokeObjectURL(url)
    }
  }, [analysisData, pdfFile, router])

  if (!analysisData) {
    return null // or a loading spinner while redirecting
  }

  const handleReset = () => {
    clearData()
    router.push('/')
  }

  return (
    <Dashboard 
      onReset={handleReset} 
      analysisData={analysisData}
      pdfUrl={pdfUrl}
    />
  )
}
