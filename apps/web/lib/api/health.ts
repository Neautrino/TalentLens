export interface HealthStatusResponse {
  status: string
  service: string
  timestamp: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetchServerHealth(): Promise<HealthStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch server health: ${res.statusText}`)
  }

  return res.json()
}
