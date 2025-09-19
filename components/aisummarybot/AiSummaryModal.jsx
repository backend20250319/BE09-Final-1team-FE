'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function AiSummaryModal({
  data, // { summary, cached, ... }
  loading,
  error,
  onClose,
  anchorX, // ⬅️ 마우스 클릭 X (clientX)
  anchorY, // ⬅️ 마우스 클릭 Y (clientY)
  offset = 8, // 클릭 지점에서 아래로 살짝 띄우기
  preferredWidth = 420,
  lines, // 표시 라인 수. 없으면 응답/기본값(3) 사용
  isOpen,
}) {
  // ✅ 훅(Hook)들을 컴포넌트 최상단으로 이동시켜 항상 호출되도록 수정
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const summary = data?.summary ?? '';
  const maxLines = Math.max(1, Number(lines ?? data?.lines ?? 3) || 3);

  // 요약을 maxLines 개로 가공
  const linesToShow = useMemo(() => {
    if (!summary) return [];
    // 1) 개행 우선
    let parts = summary.split(/\r?\n/);
    // 2) 개행이 부족하면 불릿/번호/문장 단위 보조 분해
    if (parts.length < 2) {
      parts = summary
        .split(/\s*(?:\d\s*[.)]|[•\-–—]\s)\s*/g)
        .flatMap((s) => s.split(/(?<=[.!?])\s/));
    }
    // 3) 불릿/번호 제거  트리밍  공백 제거
    const cleaned = parts
      .map((s) => s.replace(/^\s*(?:\d\s*[.)]|[•\-–—])\s*/, '').trim())
      .filter(Boolean);
    // 4) 요청 라인 수만큼 표시
    return cleaned.slice(0, maxLines);
  }, [summary, maxLines]);

  // 위치 계산(뷰포트 밖 방지)
  useEffect(() => {
    // 모달이 열려있지 않으면 위치 계산 로직을 실행하지 않음
    if (!isOpen) return;

    const padding = 8;
    const cx = typeof anchorX === 'number' ? anchorX : 500;
    const cy = typeof anchorY === 'number' ? anchorY : 300;

    const measureAndClamp = () => {
      // panelRef.current가 아직 설정되지 않았을 수 있으므로 확인
      if (!panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const left = Math.min(
        Math.max(padding, cx - width / 2),
        Math.max(padding, window.innerWidth - width - padding),
      );
      const top = Math.min(
        Math.max(padding, cy + offset),
        Math.max(padding, window.innerHeight - height - padding),
      );
      setPos({ top, left });
    };

    // 한 프레임 뒤 실제 크기 기준으로 보정
    requestAnimationFrame(measureAndClamp);
    // 리사이즈 시 재보정
    window.addEventListener('resize', measureAndClamp);
    return () => window.removeEventListener('resize', measureAndClamp);
  }, [isOpen, anchorX, anchorY, offset, preferredWidth]); // 의존성 배열에 isOpen 추가

  const copy = async () => {
    const textToCopy = linesToShow.join('\n');
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('요약이 복사되었습니다.');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success('요약이 복사되었습니다.');
    }
  };

  // ✅ 훅 호출이 모두 끝난 뒤에 조건부로 렌더링을 중단
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/30"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* 패널: 클릭 좌표 기준 fixed 위치 */}
      <div
        ref={panelRef}
        className="fixed z-[9999] w-[420px] rounded-xl border bg-white p-5 shadow-xl"
        style={{ top: pos.top, left: pos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/summarybot.png" alt="AI 요약봇" width={30} height={30} />
            <h2 className="text-base font-semibold">세 줄 요약</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              disabled={loading || !summary}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
              title="클립보드에 복사"
            >
              요약 복사
            </button>
            <button onClick={onClose} className="text-xl leading-none" aria-label="닫기">
              ×
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="min-h-[88px] text-sm text-gray-800">
          {loading && <div>요약 중…</div>}
          {!loading && error && <span className="text-red-600">⚠ {error}</span>}
          {!loading &&
            !error &&
            (linesToShow.length > 0 ? (
              <ul className="list-none space-y-2 leading-relaxed">
                {linesToShow.map((line, i) => (
                  <li key={i} className="whitespace-pre-wrap">
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">요약된 내용이 없습니다.</div>
            ))}
        </div>

        {/* 푸터 안내 */}
        <div className="mt-4 border-t pt-3 text-[11px] leading-4 text-gray-500">
          ※ 아래 내용은 인공지능(ChatGPT 4.1 mini)을 통해 자동으로 요약된 결과입니다. <br />
          AI 요약 기술의 특성상 일부 정보가 생략되거나 왜곡될 수 있으므로, 정확한 이해를 위해 기사
          본문 전체 보기를 권장합니다.
        </div>
      </div>
    </div>
  );
}
