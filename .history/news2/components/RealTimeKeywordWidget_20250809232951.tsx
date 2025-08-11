"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ArrowDown, Minus, TrendingUp, X } from "lucide-react"
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
  const [showModal, setShowModal] = useState(false)

  const timerRef = useRef<number | null>(null)

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
    setShowModal(true)
    setPaused(true)
    
    // 5초 후 자동으로 모달 닫기 및 재생 재개
    setTimeout(() => {
      setShowModal(false)
      setPaused(false)
    }, 5000)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setPaused(false)
  }

  return (
    <>
      <div
        className="glass-enhanced hover-lift animate-slide-in rounded-xl shadow-md px-4 py-3 shimmer-effect"
        style={{ width, "--delay": "0.2s" } as React.CSSProperties}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
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

      {/* 전체 순위 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center text-lg font-semibold">
                <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                실시간 인기 키워드 순위
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div 
                    key={`${item.keyword}-${item.rank}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className={`font-bold text-lg w-8 text-center ${
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
                      <span className="text-gray-800 font-medium">
                        {item.keyword}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DiffIcon diff={item.diff} />
                      {item.rank <= 3 && (
                        <Badge 
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full shadow-lg"
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
        </div>
      )}
    </>
  )
}
