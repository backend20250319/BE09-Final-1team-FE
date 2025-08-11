"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Minus, TrendingUp, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Item = { keyword: string; rank: number; diff: number };

const seed = ["총선", "가상화폐", "카카오", "환경 보호", "주식 시장", "삼성", "인공지능"];

export default function RealTimeKeywordWidget({
  intervalMs = 2500,
  width = 280,
}: {
  intervalMs?: number;
  width?: number | string;
}) {
  // 초기 데이터 (실서비스에선 서버/소켓 데이터로 교체)
  const [items, setItems] = useState<Item[]>(
    seed.map((kw, i) => ({ keyword: kw, rank: i + 1, diff: 0 }))
  );
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<number | null>(null);

  // 주기적 순환
  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => {
      // 다음 인덱스
      setIdx((p) => (p + 1) % items.length);

      // 데모용: 순위 셔플(실서비스: 서버에서 diff/순위 받아오기)
      setItems((prev) => {
        const shuffled = [...prev]
          .sort(() => Math.random() - 0.5)
          .map((k, i) => ({ ...k, diff: k.rank - (i + 1), rank: i + 1 }));
        return shuffled;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [intervalMs, paused, items.length]);

  const cur = items[idx];

  const DiffIcon = ({ diff }: { diff: number }) =>
    diff < 0 ? (
      <ArrowUp className="w-3 h-3 text-red-500" />
    ) : diff > 0 ? (
      <ArrowDown className="w-3 h-3 text-blue-500" />
    ) : (
      <Minus className="w-3 h-3 text-gray-400" />
    );

  return (
    <div
      className="glass hover-lift animate-slide-in rounded-xl shadow-md px-4 py-2"
      style={{ width }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-sm font-semibold text-gray-800">
          <TrendingUp className="h-4 w-4 mr-2 text-red-500" />
          실시간 인기 키워드
        </div>
        <button
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "재생" : "일시정지"}
        </button>
      </div>

      {/* 한 줄 티커 영역 */}
      <div className="h-9 overflow-hidden">
        {/* 키 바뀔 때마다 자연스러운 페이드/슬라이드 */}
        <div
          key={`${cur.keyword}-${cur.rank}`}
          className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/50"
        >
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-md">
              {cur.rank}
            </Badge>
            <span className="text-sm text-gray-800">{cur.keyword}</span>
            <DiffIcon diff={cur.diff} />
          </div>
          <Badge className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded-full shadow-lg">
            HOT
          </Badge>
        </div>
      </div>
    </div>
  );
}
