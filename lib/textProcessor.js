import { termsDictionary } from './terms';

export function renderTextWithTooltips(text) {
  console.log('🔍 renderTextWithTooltips 호출됨:', text);
  if (!text) return text;

  // 백엔드에서 오는 span 태그만 처리
  return processBackendSpans(text);
}

// 백엔드에서 오는 span 태그를 처리하는 함수
function processBackendSpans(text) {
  if (!text || typeof text !== 'string') return text;

  console.log('🔍 processBackendSpans 시작:', text.substring(0, 100) + '...');

  // 먼저 백엔드에서 오는 이스케이프 문자들을 디코딩
  let decodedText = text
    .replace(/\\"/g, '"') // 백슬래시 이스케이프 제거
    .replace(/\\n/g, '') // 줄바꿈 제거
    .replace(/\\r/g, '') // 캐리지 리턴 제거
    .replace(/\\t/g, '') // 탭 제거
    .replace(/&quot;/g, '"') // HTML 엔티티 디코딩
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  console.log('🔍 HTML 디코딩 후:', decodedText.substring(0, 200) + '...');

  // span 태그가 있는지 확인
  const hasSpanTag = decodedText.includes('<span class="tooltip-word"');
  console.log('🔍 span 태그 포함 여부:', hasSpanTag);

  if (hasSpanTag) {
    console.log('🔍 span 태그 위치:', decodedText.indexOf('<span class="tooltip-word"'));
    console.log(
      '🔍 span 태그 주변 텍스트:',
      decodedText.substring(
        Math.max(0, decodedText.indexOf('<span class="tooltip-word"') - 50),
        decodedText.indexOf('<span class="tooltip-word"') + 100,
      ),
    );
  }

  // span 태그를 찾아서 툴팁 객체로 변환
  // 정규식 대신 문자열 파싱 방식 사용
  let result = [decodedText];
  let matchCount = 0;

  // span 태그를 하나씩 찾아서 처리
  let currentText = decodedText;
  let startIndex = 0;

  while (true) {
    const spanStart = currentText.indexOf('<span class="tooltip-word"', startIndex);
    if (spanStart === -1) break;

    // span 태그의 시작과 끝 찾기
    const spanEnd = currentText.indexOf('</span>', spanStart);
    if (spanEnd === -1) break;

    const fullSpan = currentText.substring(spanStart, spanEnd + 7); // '</span>' 길이 7

    // data-term 추출
    const termMatch = fullSpan.match(/data-term="([^"]+)"/);
    if (!termMatch) {
      startIndex = spanStart + 1;
      continue;
    }
    const term = termMatch[1];

    // data-definitions 추출
    const definitionsMatch = fullSpan.match(/data-definitions="([^"]+)"/);
    if (!definitionsMatch) {
      console.log('🔍 data-definitions를 찾을 수 없음');
      startIndex = spanStart + 1;
      continue;
    }
    const definitionsJson = definitionsMatch[1];
    console.log('🔍 추출된 definitions JSON:', definitionsJson.substring(0, 100) + '...');

    // JSON이 잘려있는 경우를 대비해 더 정확한 추출
    let cleanDefinitionsJson = definitionsJson;

    // JSON 배열이 완전하지 않은 경우 처리
    if (definitionsJson.includes('[{') && !definitionsJson.includes('}]')) {
      // span 태그 끝까지의 전체 텍스트에서 JSON 찾기
      const fullTextAfterSpan = currentText.substring(spanStart);
      const jsonEndMatch = fullTextAfterSpan.match(/data-definitions="([^"]+)"\s*>/);
      if (jsonEndMatch) {
        cleanDefinitionsJson = jsonEndMatch[1];
        console.log('🔍 수정된 definitions JSON:', cleanDefinitionsJson.substring(0, 100) + '...');
      }
    }

    // 텍스트 내용 추출
    const textStart = fullSpan.lastIndexOf('>') + 1;
    const textContent = fullSpan.substring(textStart);
    console.log('🔍 추출된 텍스트 내용:', textContent);

    // 텍스트가 비어있다면 term을 사용
    const displayText = textContent.trim() || term;
    console.log('🔍 최종 표시 텍스트:', displayText);

    matchCount++;
    console.log(`🔍 span 태그 ${matchCount} 발견:`, {
      term,
      textContent: displayText,
      definitionsJson: cleanDefinitionsJson.substring(0, 100) + '...',
      fullSpan: fullSpan.substring(0, 100) + '...',
    });

    const parts = [];

    try {
      // data-definitions JSON 파싱
      const definitions = JSON.parse(cleanDefinitionsJson);
      console.log(`🔍 JSON 파싱 성공 (${matchCount}번째):`, definitions);

      result.forEach((segment) => {
        if (typeof segment === 'string') {
          const split = segment.split(fullSpan);

          split.forEach((part, i) => {
            if (part !== '') {
              parts.push(part);
            }
            if (i < split.length - 1) {
              // span 태그 위치에 툴팁 객체 삽입
              parts.push({
                type: 'tooltip',
                term: term,
                definitions: definitions,
                text: displayText,
                source: 'backend',
                apiCall: false,
              });
            }
          });
        } else {
          parts.push(segment);
        }
      });
    } catch (error) {
      console.warn(
        `🔍 JSON 파싱 실패 (${matchCount}번째):`,
        error,
        '원본 JSON:',
        cleanDefinitionsJson,
      );

      // JSON 파싱 실패 시에도 툴팁은 표시하되 API 호출로 정의를 가져오도록 설정
      result.forEach((segment) => {
        if (typeof segment === 'string') {
          const split = segment.split(fullSpan);

          split.forEach((part, i) => {
            if (part !== '') {
              parts.push(part);
            }
            if (i < split.length - 1) {
              parts.push({
                type: 'tooltip',
                term: term,
                definitions: null,
                text: displayText,
                source: 'backend',
                apiCall: true,
              });
            }
          });
        } else {
          parts.push(segment);
        }
      });
    }

    result = parts;
    console.log(`🔍 ${matchCount}번째 span 처리 후 segments 수:`, result.length);

    // 다음 검색을 위해 인덱스 업데이트
    startIndex = spanEnd + 7;
  }

  console.log(`🔍 총 ${matchCount}개의 span 태그 발견됨`);
  console.log('🔍 processBackendSpans 완료, 결과 타입:', typeof result, '길이:', result.length);
  return result;
}

// 기존 DOM 기반 함수들은 제거 (더 이상 사용하지 않음)
export function processTextWithTooltips(text) {
  // 이 함수는 더 이상 사용하지 않으므로 빈 문자열 반환
  return text;
}

export function createTooltipElements() {
  // 이 함수는 더 이상 사용하지 않으므로 아무것도 하지 않음
}
