// 뉴스 본문, 이미지, 관련 키워드를 표시하는 컴포넌트
'use client';

import React from 'react';
import TermTooltip from '@/components/tooltip';

// 깨진 alt 속성만 정리하는 함수
const cleanBrokenHtml = (html) => {
  if (!html || typeof html !== 'string') return html;

  // 디버깅을 위한 로그
  console.log('🔍 원본 HTML:', html.substring(0, 500));

  // 이미지 태그를 완전히 정리
  let cleaned = html
    // 1. alt 속성 전체를 제거 (span 태그 때문에 파싱 오류 발생)
    .replace(/\s+alt="[^"]*"/gi, '')
    // 2. data-src를 src로 변환
    .replace(/data-src="([^"]*)"/gi, 'src="$1"')
    // 3. lazy loading 클래스 제거하고 둥근 모서리 스타일 추가
    .replace(
      /class="_LAZY_LOADING[^"]*"/gi,
      'class="lazy-image" style="border-radius: 20px; max-width: 100%; height: auto;"',
    )
    // 4. img 태그 뒤에 남은 style="display: none;"> 텍스트 제거
    .replace(/\s*style="display:\s*none;"\s*>/gi, '>');

  console.log('🔍 정리된 HTML:', cleaned.substring(0, 500));

  return cleaned;
};

// HTML을 안전하게 렌더링하면서 툴팁도 처리하는 함수
const renderHtmlWithTooltips = (html) => {
  if (!html || typeof html !== 'string') return html;

  console.log('🔍 renderHtmlWithTooltips 입력:', html.substring(0, 200));

  // tooltip-word 클래스를 가진 span 태그를 찾아서 처리
  let processedHtml = html;
  const tooltipMatches = [];

  // tooltip-word 클래스를 가진 span 태그를 찾는 정규식
  const spanRegex = /<span class="tooltip-word"[^>]*>([^<]*)<\/span>/gi;
  let match;

  while ((match = spanRegex.exec(html)) !== null) {
    console.log('🔍 툴팁 매칭:', match[0]);

    // 전체 span 태그에서 data-term과 data-definitions 추출
    const fullSpan = match[0];
    const termMatch = fullSpan.match(/data-term="([^"]*)"/);
    // data-definitions는 JSON 문자열이므로 더 정확한 정규표현식 사용
    const definitionsMatch = fullSpan.match(/data-definitions="(\[.*?\])"/);

    if (termMatch && definitionsMatch) {
      const term = termMatch[1];
      const definitionsJson = definitionsMatch[1];
      const text = match[1];

      try {
        const definitions = JSON.parse(definitionsJson);
        tooltipMatches.push({
          original: fullSpan,
          term,
          definitions,
          text,
        });
      } catch (error) {
        console.warn('툴팁 정의 파싱 실패:', error);
      }
    }
  }

  // 매칭된 툴팁들을 React 컴포넌트로 교체
  const parts = [];
  let lastIndex = 0;

  tooltipMatches.forEach((tooltip, index) => {
    const spanIndex = processedHtml.indexOf(tooltip.original, lastIndex);

    if (spanIndex > lastIndex) {
      parts.push(
        <span
          key={`html-${index}`}
          dangerouslySetInnerHTML={{ __html: processedHtml.substring(lastIndex, spanIndex) }}
        />,
      );
    }

    parts.push(
      <TermTooltip
        key={`tooltip-${index}`}
        term={tooltip.term}
        definitions={tooltip.definitions}
        text={tooltip.text}
        source="backend"
        apiCall={false}
      >
        {tooltip.text}
      </TermTooltip>,
    );

    lastIndex = spanIndex + tooltip.original.length;
  });

  // 마지막 부분 추가
  if (lastIndex < processedHtml.length) {
    parts.push(
      <span
        key={`html-final`}
        dangerouslySetInnerHTML={{ __html: processedHtml.substring(lastIndex) }}
      />,
    );
  }

  return parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const NewsContent = ({ newsData, fontSize }) => {
  // 디버깅: newsData 확인
  console.log('🔍 NewsContent newsData:', newsData);
  console.log('🔍 newsData.content:', newsData?.content);

  return (
    <>
      <article
        className="prose prose-lg max-w-none text-lg leading-relaxed text-gray-800"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div>{renderHtmlWithTooltips(cleanBrokenHtml(newsData.content))}</div>
      </article>
      {newsData.tags && newsData.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">관련 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {newsData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NewsContent;
