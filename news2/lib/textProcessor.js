import { termsDictionary } from './terms'

export function processTextWithTooltips(text) {
  if (!text) return text

  // 용어 사전의 모든 키를 길이 순으로 정렬 (긴 단어부터 매칭)
  const sortedTerms = Object.keys(termsDictionary).sort((a, b) => b.length - a.length)
  
  let processedText = text
  
  // 각 용어에 대해 툴팁 적용
  sortedTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi')
    const termInfo = termsDictionary[term]
    
    processedText = processedText.replace(regex, (match, p1) => {
      return `<span class="term-tooltip" data-term="${termInfo.term}" data-definition="${termInfo.definition}">${p1}</span>`
    })
  })
  
  return processedText
}

export function createTooltipElements() {
  // 페이지 로드 후 툴팁 요소들을 생성
  const tooltipElements = document.querySelectorAll('.term-tooltip')
  
  tooltipElements.forEach(element => {
    const term = element.getAttribute('data-term')
    const definition = element.getAttribute('data-definition')
    
    // 기존 툴팁 제거
    element.classList.remove('term-tooltip')
    element.classList.add('inline-flex', 'items-center', 'cursor-help', 'border-b', 'border-dashed', 'border-blue-400', 'text-blue-600', 'hover:text-blue-800', 'transition-colors')
    
    // Info 아이콘 추가
    const infoIcon = document.createElement('svg')
    infoIcon.className = 'h-3 w-3 ml-1'
    infoIcon.innerHTML = '<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    element.appendChild(infoIcon)
    
    // 툴팁 이벤트 추가
    let tooltip = null
    
    element.addEventListener('mouseenter', () => {
      if (tooltip) return
      
      tooltip = document.createElement('div')
      tooltip.className = 'absolute z-50 mt-2 w-64 animate-slide-in'
      tooltip.innerHTML = `
        <div class="bg-white/90 backdrop-blur-sm shadow-xl border border-blue-200 rounded-lg p-3">
          <div class="text-sm">
            <div class="font-semibold text-blue-800 mb-1">${term}</div>
            <div class="text-gray-600 text-xs leading-relaxed">${definition}</div>
          </div>
        </div>
      `
      
      element.style.position = 'relative'
      element.appendChild(tooltip)
    })
    
    element.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.remove()
        tooltip = null
      }
    })
  })
} 