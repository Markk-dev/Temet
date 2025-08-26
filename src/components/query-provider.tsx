
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
        
        staleTime: 30 * 1000, 
        gcTime: 5 * 60 * 1000, 
        refetchOnWindowFocus: false,
        refetchOnReconnect: false, 
        refetchOnMount: false, 
        
        
        retry: (failureCount, error) => {
          
          if (error?.message?.includes('4')) return false;
          return failureCount < 1; 
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), 
        
        
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
    
    return makeQueryClient()
  } else {
    
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