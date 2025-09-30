"use client"
import { useEffect } from 'react'
import { usePrefetchMembers } from '@/hooks/useQueries'

/**
 * GlobalDataPreloader component
 * Preloads frequently used data in the background to improve app performance
 * Should be placed high in the component tree (e.g., in layout or main page)
 */
const GlobalDataPreloader: React.FC = () => {
  const { prefetchMembers, prefetchActiveMembers } = usePrefetchMembers()

  useEffect(() => {
    // Prefetch members data on app load for better UX
    // This runs in the background and populates the cache
    prefetchMembers()
    prefetchActiveMembers()

    // Load development utilities in development mode
    if (process.env.NODE_ENV === 'development') {
      import('@/lib/devAuthUtils').catch(console.error)
    }

    // Set up periodic background refresh (optional)
    // This ensures data stays fresh without user interaction
    const interval = setInterval(() => {
      prefetchMembers()
      prefetchActiveMembers()
    }, 10 * 60 * 1000) // Refresh every 10 minutes

    return () => clearInterval(interval)
  }, [prefetchMembers, prefetchActiveMembers])

  // This component doesn't render anything visible
  return null
}

export default GlobalDataPreloader