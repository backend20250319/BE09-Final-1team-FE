"use client"

import { useEffect, useState } from "react"
import { ArrowUp, ArrowDown, Minus, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const mockKeywords = [
  "인공지능", "경제정책", "환경보호", "디지털전환", "스타트업"
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
    <div 
      className="border border-gray-300 bg-[#f8fafc] text-gray-900 hover:border-[#ff6b6b] hover:shadow-lg transition duration-200 rounded-xl p-4 overflow-visible glass hover-lift animate-slide-in" 
      style={{ animationDelay: "0.4s" }}
    >
      <div className="flex flex-col space-y-1.5 p-6 overflow-visible">
        <div className="font-semibold tracking-tight overflow-visible text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
          실시간 인기 키워드
        </div>
      </div>
      <div className="p-6 pt-0 overflow-visible">
        <div className="space-y-2">
          {keywords.map((item, index) => (
            <div 
              key={item.keyword} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300 trending-keyword"
            >
              <span className="flex items-center">
                <span className="text-sm font-medium text-blue-600 mr-2">{item.rank}</span>
                {item.keyword}
              </span>
              <div className="inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 !bg-red-500 !text-white text-xs rounded-full px-3 py-1 shadow-md">
                HOT
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
