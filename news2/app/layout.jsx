import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrapProvider } from '@/contexts/ScrapContext' // 이 부분을 추가
import Footer from '../components/footer'


export const metadata = {
  title: "NewSPhere - 최신 뉴스와 정보",
  description: "실시간 뉴스, 커뮤니티, 뉴스레터를 제공하는 종합 뉴스 플랫폼",
  keywords: "뉴스, 커뮤니티, 뉴스레터, 실시간뉴스",
  authors: [{ name: "New NormalLists" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: "NoonnuBasicGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
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
        <Footer />
      </body>
    </html>
  );
}
