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

  // span 태그를 찾아서 툴팁 객체로 변환 (data-definitions 포함)
  const spanRegex =
    /<span class="tooltip-word" data-term="([^"]+)" data-definitions="([^"]+)">([^<]+)<\/span>/g;

  let result = [text];
  let match;

  while ((match = spanRegex.exec(text)) !== null) {
    const [fullMatch, term, definitionsJson, textContent] = match;
    console.log('🔍 span 태그 발견:', {
      term,
      textContent,
      definitionsJson: definitionsJson.substring(0, 50) + '...',
    });

    const parts = [];

    try {
      // data-definitions JSON 파싱
      const definitions = JSON.parse(definitionsJson.replace(/\\"/g, '"'));
      console.log('🔍 JSON 파싱 성공:', definitions);

      result.forEach((segment) => {
        if (typeof segment === 'string') {
          const split = segment.split(fullMatch);

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
                text: textContent,
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
      console.warn('JSON 파싱 실패:', error);

      result.forEach((segment) => {
        if (typeof segment === 'string') {
          const split = segment.split(fullMatch);

          split.forEach((part, i) => {
            if (part !== '') {
              parts.push(part);
            }
            if (i < split.length - 1) {
              parts.push({
                type: 'tooltip',
                term: term,
                definitions: null,
                text: textContent,
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
    console.log('🔍 처리 후 segments 수:', result.length);
  }

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
