import React from 'react'
import { cn } from '@/lib/utils/utils'
import { Card, CardContent } from './card'

// 1. 스피너 컴포넌트 (단순 처리 중 표시)
export function Spinner({ 
  size = 'md', 
  color = 'blue', 
  className 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }
  
  const colorClasses = {
    white: 'border-white border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

// 2. 로딩 버튼 (버튼 클릭 시 처리 중 상태)
export function LoadingButton({ 
  children, 
  loading, 
  loadingText = '처리 중...',
  disabled,
  className,
  ...props 
}) {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      {loading ? loadingText : children}
    </button>
  )
}

// 3. 로딩 오버레이 (전체 화면 로딩)
export function LoadingOverlay({ 
  visible, 
  text = '로딩 중...',
  className 
}) {
  if (!visible) return null

  return (
    <div className={cn(
      'fixed inset-0 bg-black/50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
        <Spinner size="lg" color="blue" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}

// 4. 카드 로딩 스켈레톤 (카드 레이아웃용)
export function CardLoadingSkeleton({ className }) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 5. 텍스트 로딩 스켈레톤 (텍스트 블록용)
export function TextLoadingSkeleton({ 
  lines = 3, 
  className 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            'h-4 bg-gray-200 rounded animate-pulse',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// 6. 리스트 로딩 스켈레톤 (리스트 아이템용)
export function ListLoadingSkeleton({ 
  items = 3, 
  className 
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 7. 인라인 로딩 (텍스트 옆에 작은 로딩 표시)
export function InlineLoading({ 
  text = '로딩 중...',
  className 
}) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-500', className)}>
      <Spinner size="sm" color="gray" />
      <span>{text}</span>
    </div>
  )
}

// 8. 센터 로딩 (컨테이너 중앙에 로딩 표시)
export function CenterLoading({ 
  text = '로딩 중...',
  className 
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8', className)}>
      <Spinner size="lg" color="blue" />
      <p className="text-sm text-gray-500 mt-3">{text}</p>
    </div>
  )
}
