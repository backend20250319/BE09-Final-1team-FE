"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function TermTooltip({ term, definition, children }) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  const updateTooltipPosition = (event) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const mouseX = event.clientX
      const mouseY = event.clientY
      
      // 마우스 커서 근처에 툴팁 위치 설정
      setTooltipPosition({
        top: mouseY + 10, // 마우스 커서 아래 10px
        left: mouseX + 10  // 마우스 커서 오른쪽 10px
      })
    }
  }

  useEffect(() => {
    if (isVisible) {
      // 초기 위치 설정을 위해 마우스 이벤트 사용
      const handleMouseMove = (event) => {
        updateTooltipPosition(event)
      }
      
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('scroll', () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect()
          setTooltipPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX
          })
        }
      })
      window.addEventListener('resize', () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect()
          setTooltipPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.left + window.scrollX
          })
        }
      })
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('scroll', updateTooltipPosition)
        window.removeEventListener('resize', updateTooltipPosition)
      }
    }
  }, [isVisible])

  const handleMouseEnter = (event) => {
    setIsVisible(true)
    updateTooltipPosition(event)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center cursor-help border-b border-dashed border-blue-400 text-blue-600 hover:text-blue-800 transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <Info className="h-3 w-3 ml-1" />
      </span>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] animate-slide-in"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'none' // 중앙 정렬 제거
          }}
        >
          <Card className="glass shadow-xl border-blue-200 min-w-[280px] max-w-[320px]">
            <CardContent className="p-3">
              <div className="text-sm">
                <div className="font-semibold text-blue-800 mb-1">{term}</div>
                <div className="text-gray-600 text-xs leading-relaxed">{definition}</div>
              </div>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}
    </>
  )
}

// 텍스트 렌더링을 위한 헬퍼 컴포넌트
export function TextWithTooltips({ text }) {
  const { renderTextWithTooltips } = require('@/lib/textProcessor')
  const segments = renderTextWithTooltips(text)
  
  return (
    <>
      {segments.map((segment, index) => {
        if (typeof segment === 'string') {
          return <span key={index}>{segment}</span>
        } else if (segment.type === 'tooltip') {
          return (
            <TermTooltip
              key={index}
              term={segment.term}
              definition={segment.definition}
            >
              {segment.text}
            </TermTooltip>
          )
        }
        return segment
      })}
    </>
  )
} 