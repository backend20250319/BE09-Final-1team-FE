"use client"

import { ThemeProvider } from "@/components/common/ThemeProvider"
import { ScrapProvider } from "@/contexts/ScrapContext"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ScrapProvider>
          {children}
        </ScrapProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
