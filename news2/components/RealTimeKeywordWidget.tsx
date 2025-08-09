"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const seed = ["총선", "가상화폐", "카카오", "환경 보호", "주식 시장", "삼성", "인공지능"]

export default function RealTimeKeywordWidget({
  intervalMs = 2500,
  width = 270,
}: {
  intervalMs?: number
  width?: number | string
}) {
  // 초기 데이터 (실서비스에선 서버/소켓 데이터로 교체)
  const [items, setItems] = useState(
    seed.map((kw, i) => ({ keyword: kw, rank: i + 1, diff: 0 }))
  )
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showFullList, setShowFullList] = useState(false)
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 })

  const timerRef = useRef<number | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // 주기적 순환
  useEffect(() => {
    if (paused) return
    timerRef.current = window.setInterval(() => {
      // 다음 인덱스
      setIdx((p) => (p + 1) % items.length)

      // 데모용: 순위 셔플(실서비스: 서버에서 diff/순위 받아오기)
      setItems((prev) => {
        const shuffled = [...prev]
          .sort(() => Math.random() - 0.5)
          .map((k, i) => ({ ...k, diff: k.rank - (i + 1), rank: i + 1 }))
        return shuffled
      })
    }, intervalMs)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [intervalMs, paused, items.length])

  const cur = items[idx]

  const DiffIcon = ({ diff }: { diff: number }) =>
    diff < 0 ? (
      <ArrowUp className="w-3 h-3 text-red-500 animate-bounce" />
    ) : diff > 0 ? (
      <ArrowDown className="w-3 h-3 text-blue-500 animate-bounce" />
    ) : (
      <Minus className="w-3 h-3 text-gray-400" />
    )

  const handleCardClick = () => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect()
      setCardPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
    setShowFullList(true)
    setPaused(true)
  }

  const handleMouseEnter = () => {
    setPaused(true)
  }

  const handleMouseLeave = () => {
    // 약간의 지연을 두어 호버링 카드로 마우스가 이동할 시간을 줍니다
    setTimeout(() => {
      setShowFullList(false)
      setPaused(false)
    }, 100)
  }

  return (
    <>
      <div
        ref={widgetRef}
        className="glass-enhanced hover-lift animate-slide-in rounded-xl shadow-md px-4 py-3 shimmer-effect relative"
        style={{ width, "--delay": "0.2s" } as React.CSSProperties}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="glass-content">
          {/* 헤더 */}
          <div className="flex items-center mb-3">
            <div className="flex items-center text-sm font-semibold">
              <TrendingUp className="h-4 w-4 mr-2 text-red-500" />
              실시간 인기 키워드
            </div>
          </div>

          {/* 한 줄 티커 영역 */}
          <div className="h-9 overflow-hidden">
            {/* 키 바뀔 때마다 자연스러운 페이드/슬라이드 */}
            <div
              key={`${cur.keyword}-${cur.rank}`}
              className="keyword-item-glass flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-500 group cursor-pointer hover:bg-blue-50 hover:border-2 hover:border-blue-200 hover:shadow-lg hover:scale-105"
              style={{ "--delay": "0.3s" } as React.CSSProperties}
              onClick={handleCardClick}
            >
              <span className="flex items-center gap-2">
                <span 
                  className={`font-bold w-5 text-right ${
                    cur.rank === 1
                      ? "text-red-500"
                      : cur.rank === 2
                      ? "text-orange-500"
                      : cur.rank === 3
                      ? "text-yellow-500"
                      : "text-blue-600"
                  }`}
                >
                  {cur.rank}
                </span>
                <span className="text-gray-800 group-hover:text-blue-700 group-hover:underline transition-colors duration-200">
                  {cur.keyword}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <DiffIcon diff={cur.diff} />
                {cur.rank <= 3 && (
                  <Badge 
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
                  >
                    HOT
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 리스트 호버링 카드 - 컨테이너 밖으로 나오도록 */}
      {showFullList && (
        <div 
          className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-64 overflow-y-auto"
          style={{
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            width: typeof width === 'number' ? `${width}px` : width,
            minWidth: '250px'
          }}
          onMouseEnter={() => {
            setPaused(true)
            setShowFullList(true)
          }}
          onMouseLeave={() => {
            setShowFullList(false)
            setPaused(false)
          }}
        >
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-600 mb-2 px-2">전체 순위</div>
            <div className="space-y-1">
              {items.map((item, index) => (
                <div 
                  key={`${item.keyword}-${item.rank}-${index}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-bold text-sm w-6 text-center ${
                        item.rank === 1
                          ? "text-red-500"
                          : item.rank === 2
                          ? "text-orange-500"
                          : item.rank === 3
                          ? "text-yellow-500"
                          : "text-blue-600"
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span className="text-gray-800 text-sm">
                      {item.keyword}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DiffIcon diff={item.diff} />
                    {item.rank <= 3 && (
                      <Badge 
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full shadow-lg"
                      >
                        HOT
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
