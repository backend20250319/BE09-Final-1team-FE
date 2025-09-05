import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/footer';
import Header from '@/components/header';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Header />
          <Providers>
            <Suspense
              fallback={
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600"></p>
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
            <Footer />
            <Toaster richColors position="bottom-right" />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
