'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { renderTextWithTooltips } from '@/lib/utils/textProcessor';

export default function TermTooltip({ term, definition, definitions, children, source, apiCall }) {
  console.log('🔍 TermTooltip 렌더링:', {
    term,
    definition,
    definitions,
    children,
    source,
    apiCall,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [dynamicDefinitions, setDynamicDefinitions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef(null);

  const updateTooltipPosition = (event) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // 툴팁을 가로로 표시하기 위해 위치 조정
      // 화면 너비를 고려하여 툴팁이 화면 밖으로 나가지 않도록 조정
      const tooltipWidth = 400; // max-w-[400px]
      const tooltipHeight = 120; // 예상 높이 (더 여유있게)
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let left = mouseX + 10;
      let top = mouseY + 10;

      // 오른쪽으로 나가는 경우 왼쪽에 표시
      if (left + tooltipWidth > windowWidth) {
        left = mouseX - tooltipWidth - 10;
      }

      // 아래로 나가는 경우 위에 표시
      if (top + tooltipHeight > windowHeight) {
        top = mouseY - tooltipHeight - 10;
      }

      // 최소값 보장
      left = Math.max(10, left);
      top = Math.max(10, top);

      setTooltipPosition({
        top: top,
        left: left,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      // 초기 위치 설정을 위해 마우스 이벤트 사용
      const handleMouseMove = (event) => {
        updateTooltipPosition(event);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('scroll', () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          const tooltipWidth = 400;
          const tooltipHeight = 120;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          let left = rect.left + window.scrollX;
          let top = rect.bottom + window.scrollY + 5;

          // 오른쪽으로 나가는 경우 왼쪽에 표시
          if (left + tooltipWidth > windowWidth) {
            left = rect.right + window.scrollX - tooltipWidth - 5;
          }

          // 아래로 나가는 경우 위에 표시
          if (top + tooltipHeight > windowHeight) {
            top = rect.top + window.scrollY - tooltipHeight - 5;
          }

          // 최소값 보장
          left = Math.max(10, left);
          top = Math.max(10, top);

          setTooltipPosition({
            top: top,
            left: left,
          });
        }
      });
      window.addEventListener('resize', () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          const tooltipWidth = 400;
          const tooltipHeight = 120;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          let left = rect.left + window.scrollX;
          let top = rect.bottom + window.scrollY + 5;

          // 오른쪽으로 나가는 경우 왼쪽에 표시
          if (left + tooltipWidth > windowWidth) {
            left = rect.right + window.scrollX - tooltipWidth - 5;
          }

          // 아래로 나가는 경우 위에 표시
          if (top + tooltipHeight > windowHeight) {
            top = rect.top + window.scrollY - tooltipHeight - 5;
          }

          // 최소값 보장
          left = Math.max(10, left);
          top = Math.max(10, top);

          setTooltipPosition({
            top: top,
            left: left,
          });
        }
      });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', updateTooltipPosition);
        window.removeEventListener('resize', updateTooltipPosition);
      };
    }
  }, [isVisible]);

  // API 호출이 필요한 경우 정의를 가져오는 함수
  const fetchDefinitions = async () => {
    if (!apiCall || dynamicDefinitions) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8086/api/news/analysis/definition/${encodeURIComponent(term)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setDynamicDefinitions(data.definitions);
      }
    } catch (error) {
      console.warn('용어 정의 API 호출 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 마우스 진입 시 API 호출
  const handleMouseEnter = (event) => {
    setIsVisible(true);
    updateTooltipPosition(event);

    // API 호출이 필요한 경우 정의 가져오기
    if (apiCall) {
      fetchDefinitions();
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

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

      {isVisible &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[9999] animate-tooltip-fade-in"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: 'none', // 중앙 정렬 제거
            }}
          >
            <Card className="glass shadow-xl border-blue-200 min-w-[320px] max-w-[450px]">
              <CardContent className="p-4">
                <div className="text-base">
                  <div className="font-semibold text-blue-800 mb-3 break-words leading-normal text-lg">
                    {term}
                  </div>

                  {/* 정의 표시 */}
                  {definitions && definitions.length > 0 ? (
                    // 백엔드에서 온 정의들
                    <div className="space-y-2">
                      {definitions.map((def, index) => (
                        <div
                          key={index}
                          className="text-gray-600 text-sm leading-relaxed break-words"
                        >
                          <span className="font-medium text-blue-600">{index + 1}.</span>{' '}
                          {def.def || def.definition}
                        </div>
                      ))}
                    </div>
                  ) : definition ? (
                    <div className="text-gray-600 text-sm leading-relaxed break-words">
                      {definition}
                    </div>
                  ) : apiCall ? (
                    // API 호출이 필요한 경우
                    <div className="text-gray-600 text-sm leading-relaxed break-words">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          <span>정의를 불러오는 중...</span>
                        </div>
                      ) : dynamicDefinitions ? (
                        // 동적으로 가져온 정의들
                        <div className="space-y-2">
                          {dynamicDefinitions.map((def, index) => (
                            <div
                              key={index}
                              className="text-gray-600 text-sm leading-relaxed break-words"
                            >
                              <span className="font-medium text-blue-600">{index + 1}.</span>{' '}
                              {def.definition}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>정의를 불러올 수 없습니다.</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">정의가 없습니다.</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body,
        )}
    </>
  );
}

// 텍스트 렌더링을 위한 헬퍼 컴포넌트
export function TextWithTooltips({ text }) {
  console.log('🔍 TextWithTooltips 호출됨, text:', text);

  // const { renderTextWithTooltips } = require('@/lib/textProcessor')
  const segments = renderTextWithTooltips(text);

  // segments가 배열이 아닌 경우 처리
  if (!Array.isArray(segments)) {
    console.warn('🔍 segments가 배열이 아님:', segments);
    return <span className="inline">{text}</span>;
  }

  return (
    <span className="inline">
      {segments.map((segment, index) => {
        console.log('🔍 segment 처리 중:', segment, index);

        if (typeof segment === 'string') {
          return (
            <span key={index} className="inline">
              {segment}
            </span>
          );
        } else if (segment && segment.type === 'tooltip') {
          console.log('🔍 툴팁 렌더링:', segment);
          return (
            <TermTooltip
              key={index}
              term={segment.term}
              definition={segment.definition}
              definitions={segment.definitions}
              source={segment.source}
              apiCall={segment.apiCall}
            >
              {segment.text}
            </TermTooltip>
          );
        }
        return (
          <span key={index} className="inline">
            {segment}
          </span>
        );
      })}
    </span>
  );
}
