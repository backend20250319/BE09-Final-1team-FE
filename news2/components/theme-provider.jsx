'use client'
import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { createContext, useContext, useEffect, useState } from 'react'

// 테마 컨텍스트 생성
const ThemeContext = createContext()

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children, ...props }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 다크모드 관련 추가 기능들
  const themeUtils = {
    // 다크모드 여부 확인
    isDarkMode: () => {
      if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark')
      }
      return false
    },

    // 시스템 테마 감지
    getSystemTheme: () => {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    },

    // 테마 전환 애니메이션
    toggleThemeWithAnimation: (setTheme, currentTheme) => {
      const root = document.documentElement
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
      
      // 부드러운 전환을 위한 CSS 클래스 추가
      root.classList.add('theme-transitioning')
      
      setTimeout(() => {
        setTheme(newTheme)
        root.classList.remove('theme-transitioning')
      }, 150)
    }
  }

  // 마운트 전까지 기본 테마 사용
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={themeUtils}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

// 테마 전환 버튼 컴포넌트
export function ThemeToggle() {
  const { useTheme: useNextTheme } = require('next-themes')
  const { theme, setTheme } = useNextTheme()
  const { toggleThemeWithAnimation } = useTheme()

  const handleToggle = () => {
    toggleThemeWithAnimation(setTheme, theme)
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="테마 전환"
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}
