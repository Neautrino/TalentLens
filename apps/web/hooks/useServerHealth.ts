import { useQuery } from '@tanstack/react-query'
import { fetchServerHealth, type HealthStatusResponse } from '../lib/api/health'

export function useServerHealth() {
  return useQuery<HealthStatusResponse, Error>({
    queryKey: ['server-health'],
    queryFn: fetchServerHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  })
}
