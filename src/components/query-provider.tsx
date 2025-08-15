
'use client'


import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Much longer stale time to reduce API calls
        staleTime: 5 * 60 * 1000, // 5 minutes instead of 30 seconds
        gcTime: 10 * 60 * 1000, // 10 minutes instead of 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false, // Don't refetch on reconnect to improve performance
        refetchOnMount: false, // Don't refetch on mount if data exists
        
        // Optimize retry logic
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors, only on network issues
          if (error?.message?.includes('4')) return false;
          return failureCount < 1; // Reduce retries to 1
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Faster retry delay
        
        // Optimize network mode
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        networkMode: 'online',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Always create a new client for SSR
    return makeQueryClient()
  } else {
    // Create a singleton client for the browser
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

interface QueryClientProviderProps {
  children: React.ReactNode;
};

export const QueryProvider = ({ children }: QueryClientProviderProps) => {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}