"use client"

import { useEffect, useState } from "react"
import { ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const mockKeywords = [
  "인공지능", "총선", "환경 보호", "주식 시장", "가상화폐", "삼성", "카카오"
]

export default function RealTimeKeywordWidget() {
  const [keywords, setKeywords] = useState(
    mockKeywords.map((kw, i) => ({
      keyword: kw,
      rank: i + 1,
      diff: 0,
    }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setKeywords((prev) => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5).map((k, i) => ({
          ...k,
          diff: k.rank - (i + 1),
          rank: i + 1,
        }))
        return shuffled
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getDiffIcon = (diff: number) => {
    if (diff < 0) return <ArrowUp className="w-3 h-3 text-red-500 animate-bounce" />
    if (diff > 0) return <ArrowDown className="w-3 h-3 text-blue-500 animate-bounce" />
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  return (
    <div className="keyword-glass hover-lift animate-slide-in rounded-xl px-4 py-3 w-[270px]" style={{ "--delay": "0.2s" }}>
      <div className="flex items-center mb-3 text-sm font-semibold relative z-10">
        <TrendingUp className="h-4 w-4 mr-2 text-red-500" />
        실시간 인기 키워드
      </div>
      <div className="space-y-1 relative z-10">
        {keywords.map((item, index) => (
          <div 
            key={item.keyword} 
            className="trending-keyword flex items-center justify-between text-sm px-3 py-2 hover:bg-white/50 rounded-lg transition-all duration-200 group cursor-pointer"
            style={{ "--delay": `${0.3 + index * 0.1}s` }}
          >
            <span className="flex items-center gap-2">
              <span 
                className={`font-bold w-5 text-right ${
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
              <span className="text-gray-800 group-hover:text-blue-700 group-hover:underline transition">
                {item.keyword}
              </span>
            </span>
            <div className="flex items-center gap-1">
              {getDiffIcon(item.diff)}
              {item.rank <= 3 && (
                <Badge className="text-xs bg-red-500 text-white px-2 py-1 rounded-full shadow">
                  HOT
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
