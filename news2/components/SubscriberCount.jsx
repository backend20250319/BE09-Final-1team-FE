'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function SubscriberCount({ initialCount = 15420, onCountUpdate }) {
  const [count, setCount] = useState(initialCount)
  const [isUpdating, setIsUpdating] = useState(false)

  // 구독자 수 업데이트 함수
  const updateCount = (increment = 1) => {
    setIsUpdating(true)
    setCount(prev => prev + increment)
    
    // 애니메이션 효과를 위한 타이머
    setTimeout(() => {
      setIsUpdating(false)
    }, 1000)
  }

  // 부모 컴포넌트에서 호출할 수 있도록 함수 노출
  useEffect(() => {
    if (onCountUpdate) {
      onCountUpdate(updateCount)
    }
  }, [onCountUpdate])

  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '만'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + '천'
    }
    return num.toString()
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-500 transition-all duration-300 ${
      isUpdating ? 'scale-110 text-blue-600' : ''
    }`}>
      <Users className="h-4 w-4" />
      <span className="font-medium">{formatNumber(count)}</span>
      <span>구독자</span>
    </div>
  )
} 