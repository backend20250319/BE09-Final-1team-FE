import { termsDictionary } from './terms'

export function renderTextWithTooltips(text) {
  if (!text) return text

  // 용어 사전의 모든 키를 길이 순으로 정렬 (긴 단어부터 매칭)
  const sortedTerms = Object.keys(termsDictionary).sort((a, b) => b.length - a.length)
  
  let result = [text]
  
  // 각 용어에 대해 React 컴포넌트로 변환
  sortedTerms.forEach(term => {
    const termInfo = termsDictionary[term]
    const parts = []
    
    result.forEach(segment => {
      if (typeof segment === "string") {
        const regex = new RegExp(`(${term})`, 'gi')
        const split = segment.split(regex)
        
        split.forEach((part, i) => {
          if (part.toLowerCase() === term.toLowerCase()) {
            parts.push({
              type: 'tooltip',
              term: termInfo.term,
              definition: termInfo.definition,
              text: part
            })
          } else {
            parts.push(part)
          }
        })
      } else {
        parts.push(segment) // 이미 React 요소인 경우 그대로 유지
      }
    })
    
    result = parts
  })
  
  return result
}

// 기존 DOM 기반 함수들은 제거 (더 이상 사용하지 않음)
export function processTextWithTooltips(text) {
  // 이 함수는 더 이상 사용하지 않으므로 빈 문자열 반환
  return text
}

export function createTooltipElements() {
  // 이 함수는 더 이상 사용하지 않으므로 아무것도 하지 않음
} 