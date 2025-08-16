"use client"

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from "@/components/theme-provider"
import { ScrapProvider } from "@/contexts/ScrapContext"

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지
        cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
        refetchOnWindowFocus: true, // 창 포커스시 새로고침
        refetchOnReconnect: true, // 재연결시 새로고침
        retry: 2, // 실패시 2번 재시도
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
      {/* 개발 환경에서만 React Query DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
