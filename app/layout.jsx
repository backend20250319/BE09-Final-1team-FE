import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import ErrorBoundary from "@/components/ErrorBoundary"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // 폰트 로딩 최적화
  preload: true
})

export const metadata = {
  title: "뉴스레터 구독 서비스",
  description: "관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // 청크 로딩 오류 처리
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('ChunkLoadError') || e.message.includes('Loading chunk'))) {
                console.log('청크 로딩 오류 감지, 페이지 새로고침...');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
            
            // webpack 청크 로딩 재시도
            if (typeof window !== 'undefined' && window.webpackChunkLoad) {
              const originalLoad = window.webpackChunkLoad;
              window.webpackChunkLoad = function(chunkId) {
                return originalLoad(chunkId).catch(function(error) {
                  console.log('청크 로딩 실패, 재시도 중...', chunkId);
                  return new Promise(function(resolve) {
                    setTimeout(function() {
                      originalLoad(chunkId).then(resolve).catch(function() {
                        console.log('청크 로딩 재시도 실패, 페이지 새로고침...');
                        window.location.reload();
                      });
                    }, 1000);
                  });
                });
              };
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">페이지를 로딩하는 중...</p>
                </div>
              </div>
            }>
              {children}
            </Suspense>
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
