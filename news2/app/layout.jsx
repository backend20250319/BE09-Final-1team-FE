import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "New NormalList - 나에게 최적화된 뉴스와 정보",
  description: "실시간 뉴스, 커뮤니티, 뉴스레터를 제공하는 종합 뉴스 플랫폼",
  keywords: "뉴스, 커뮤니티, 뉴스레터, 실시간뉴스",
  authors: [{ name: "New NormalList Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
