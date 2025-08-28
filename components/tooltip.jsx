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
      
      // 툴팁을 가로로 표시하기 위해 위치 조정
      // 화면 너비를 고려하여 툴팁이 화면 밖으로 나가지 않도록 조정
      const tooltipWidth = 400 // max-w-[400px]
      const tooltipHeight = 120 // 예상 높이 (더 여유있게)
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      let left = mouseX + 10
      let top = mouseY + 10
      
      // 오른쪽으로 나가는 경우 왼쪽에 표시
      if (left + tooltipWidth > windowWidth) {
        left = mouseX - tooltipWidth - 10
      }
      
      // 아래로 나가는 경우 위에 표시
      if (top + tooltipHeight > windowHeight) {
        top = mouseY - tooltipHeight - 10
      }
      
      // 최소값 보장
      left = Math.max(10, left)
      top = Math.max(10, top)
      
      setTooltipPosition({
        top: top,
        left: left
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
          const tooltipWidth = 400
          const tooltipHeight = 120
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight
          
          let left = rect.left + window.scrollX
          let top = rect.bottom + window.scrollY + 5
          
          // 오른쪽으로 나가는 경우 왼쪽에 표시
          if (left + tooltipWidth > windowWidth) {
            left = rect.right + window.scrollX - tooltipWidth - 5
          }
          
          // 아래로 나가는 경우 위에 표시
          if (top + tooltipHeight > windowHeight) {
            top = rect.top + window.scrollY - tooltipHeight - 5
          }
          
          // 최소값 보장
          left = Math.max(10, left)
          top = Math.max(10, top)
          
          setTooltipPosition({
            top: top,
            left: left
          })
        }
      })
      window.addEventListener('resize', () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect()
          const tooltipWidth = 400
          const tooltipHeight = 120
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight
          
          let left = rect.left + window.scrollX
          let top = rect.bottom + window.scrollY + 5
          
          // 오른쪽으로 나가는 경우 왼쪽에 표시
          if (left + tooltipWidth > windowWidth) {
            left = rect.right + window.scrollX - tooltipWidth - 5
          }
          
          // 아래로 나가는 경우 위에 표시
          if (top + tooltipHeight > windowHeight) {
            top = rect.top + window.scrollY - tooltipHeight - 5
          }
          
          // 최소값 보장
          left = Math.max(10, left)
          top = Math.max(10, top)
          
          setTooltipPosition({
            top: top,
            left: left
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
        style={{ display: 'inline-flex' }}
      >
        {children}
        <Info className="h-3 w-3 ml-1" />
      </span>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] animate-tooltip-fade-in"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'none' // 중앙 정렬 제거
          }}
        >
          <Card className="glass shadow-xl border-blue-200 min-w-[280px] max-w-[400px]">
            <CardContent className="p-3">
              <div className="text-sm">
                <div className="font-semibold text-blue-800 mb-2 break-words leading-normal">{term}</div>
                <div className="text-gray-600 text-xs leading-normal break-words">{definition}</div>
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
    <span className="inline">
      {segments.map((segment, index) => {
        if (typeof segment === 'string') {
          return <span key={index} className="inline">{segment}</span>
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
        return <span key={index} className="inline">{segment}</span>
      })}
    </span>
  )
} 