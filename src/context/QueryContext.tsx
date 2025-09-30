"use client"
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Enhanced retry logic that doesn't retry on auth errors
const retryFunction = (failureCount: number, error: any) => {
  // Don't retry on authentication errors
  if (error?.message?.includes('Authentication required') || 
      error?.message?.includes('Invalid or expired token')) {
    return false
  }
  
  // Retry up to 2 times for other errors
  return failureCount < 2
}

// Create a query client with optimized cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, 
      // Keep cached data for 10 minutes
      gcTime: 10 * 60 * 1000, 
      // Enhanced retry logic
      retry: retryFunction,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Refetch on mount if data is stale
      refetchOnMount: 'always',
      // Global error handling
      throwOnError: (error: any) => {
        // Handle auth errors gracefully, let other errors bubble up
        if (error?.message?.includes('Authentication required')) {
          console.warn('Query failed due to auth error:', error.message)
          return false
        }
        return true
      }
    },
    mutations: {
      // Enhanced retry logic for mutations
      retry: retryFunction,
      // Global error handling for mutations
      throwOnError: (error: any) => {
        // Handle auth errors gracefully, let other errors bubble up
        if (error?.message?.includes('Authentication required')) {
          console.warn('Mutation failed due to auth error:', error.message)
          return false
        }
        return true
      }
    }
  }
})

interface QueryProviderProps {
  children: React.ReactNode
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show dev tools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export { queryClient }