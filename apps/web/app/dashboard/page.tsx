'use client'

import { Dashboard } from '../../components/dashboard/Dashboard'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <Dashboard 
      onReset={() => router.push('/')} 
    />
  )
}
