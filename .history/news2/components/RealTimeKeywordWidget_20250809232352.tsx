"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp, ArrowDown, Minus, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import clsx from "clsx"

type Item = { keyword: string; rank: number; diff: number }

const seed = ["총선", "가상화폐", "카카오", "환경 보호", "주식 시장", "삼성", "인공지능"]

export default function RealTimeKeywordWidget() {
  // 가짜 데이터 (실서버 연결 시 교체)
  const [items, setItems] = useState<Item[]>(
    seed.map((kw, i) => ({ keyword: kw, rank: i + 1, diff: 0 }))
  )

  // 요약 모드: 1줄만 보여줌 / 펼침 모드: 전체 리스트
  const [expanded, setExpanded] = useState(false)

  // 순차 재생 인덱스
  const [idx, setIdx] = useState(0)
  const pausedRef = useRef(false)

  // 순위변화 아이콘
  const DiffIcon = ({ diff }: { diff: number }) =>
    diff < 0 ? (
      <ArrowUp className="w-3 h-3 text-red-500 animate-bounce" />
    ) : diff > 0 ? (
      <ArrowDown className="w-3 h-3 text-blue-500 animate-bounce" />
    ) : (
      <Minus className="w-3 h-3 text-gray-400" />
    )

  // ❶ 3초마다 다음 키워드로 (요약 모드에서만 동작)
  useEffect(() => {
    if (expanded) return
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setIdx((p) => (p + 1) % items.length)
      }
    }, 3000)
    return () => clearInterval(id)
  }, [expanded, items.length])

  // ❷ 5초마다 임의 순위 업데이트(데모용)
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => {
        const shuffled = [...prev]
          .sort(() => Math.random() - 0.5)
          .map((it, i) => ({ ...it, diff: it.rank - (i + 1), rank: i + 1 }))
        return shuffled
      })
    }, 5000)
    return () => clearInterval(id)
  }, [])

  // 현재 한 줄 데이터
  const current = useMemo(() => items[idx], [items, idx])

  // 외부에서 hover 시 멈춤
  const onEnter = () => (pausedRef.current = true)
  const onLeave = () => (pausedRef.current = false)

  return (
    <div
      className={clsx(
        "glass hover-lift animate-slide-in rounded-xl shadow-md",
        expanded ? "w-[270px]" : "w-[270px]"
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <div className="flex items-center text-sm font-semibold text-gray-800">
          <TrendingUp className="h-4 w-4 mr-2 text-red-500" />
          실시간 인기 키워드
        </div>
        <button
          className="text-xs text-gray-500 hover:text-gray-700 transition flex items-center"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "접기" : "펼치기"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 바디 */}
      <div className="px-2 py-2">
        {/* 요약 모드: 한 줄만 순차 표시 */}
        {!expanded && current && (
          <button
            onClick={() => setExpanded(true)}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className={clsx(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg",
              "hover:bg-indigo-50 transition-colors group"
            )}
          >
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                {current.rank}
              </Badge>
              <span className="text-sm text-gray-800 group-hover:underline">
                {current.keyword}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <DiffIcon diff={current.diff} />
              <Badge variant="secondary" className="!bg-red-500 !text-white px-2 py-0.5 text-[10px] rounded-full">
                HOT
              </Badge>
            </span>
          </button>
        )}

        {/* 펼침 모드: 전체 리스트 */}
        {expanded && (
          <div
            className="space-y-1"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {items.map((it, i) => (
              <div
                key={it.keyword}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-lg",
                  "hover:bg-indigo-50 transition-colors"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md w-7 justify-center">
                    {it.rank}
                  </Badge>
                  <span className="text-sm text-gray-800">{it.keyword}</span>
                </span>
                <span className="flex items-center gap-2">
                  <DiffIcon diff={it.diff} />
                  <Badge variant="secondary" className="!bg-red-500 !text-white px-2 py-0.5 text-[10px] rounded-full">
                    HOT
                  </Badge>
                </span>
              </div>
            ))}

            {/* 닫기 버튼 */}
            <button
              onClick={() => setExpanded(false)}
              className="w-full mt-2 text-center text-xs text-gray-500 hover:text-gray-700 py-1.5"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
