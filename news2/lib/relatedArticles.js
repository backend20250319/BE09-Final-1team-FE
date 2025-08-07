// 관련 기사 처리 유틸리티 함수들

/**
 * 카테고리 기반으로 관련 기사를 찾습니다
 * @param {Array} allArticles - 모든 기사 배열
 * @param {string} currentCategory - 현재 기사의 카테고리
 * @param {number} currentId - 현재 기사 ID
 * @param {number} limit - 반환할 기사 수 (기본값: 3)
 * @returns {Array} 관련 기사 배열
 */
export function getRelatedArticlesByCategory(allArticles, currentCategory, currentId, limit = 3) {
  return allArticles
    .filter(article => 
      article.category === currentCategory && 
      article.id !== currentId
    )
    .slice(0, limit)
}

/**
 * 무작위로 관련 기사를 선택합니다
 * @param {Array} allArticles - 모든 기사 배열
 * @param {number} currentId - 현재 기사 ID
 * @param {number} limit - 반환할 기사 수 (기본값: 3)
 * @returns {Array} 무작위 관련 기사 배열
 */
export function getRandomRelatedArticles(allArticles, currentId, limit = 3) {
  const filteredArticles = allArticles.filter(article => article.id !== currentId)
  
  // Fisher-Yates 셔플 알고리즘
  const shuffled = [...filteredArticles]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled.slice(0, limit)
}

/**
 * 키워드 기반으로 관련 기사를 찾습니다
 * @param {Array} allArticles - 모든 기사 배열
 * @param {Array} keywords - 검색할 키워드 배열
 * @param {number} currentId - 현재 기사 ID
 * @param {number} limit - 반환할 기사 수 (기본값: 3)
 * @returns {Array} 키워드 기반 관련 기사 배열
 */
export function getRelatedArticlesByKeywords(allArticles, keywords, currentId, limit = 3) {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()))
  
  const scoredArticles = allArticles
    .filter(article => article.id !== currentId)
    .map(article => {
      const titleWords = article.title.toLowerCase().split(/\s+/)
      const summaryWords = article.summary.toLowerCase().split(/\s+/)
      const allWords = [...titleWords, ...summaryWords]
      
      let score = 0
      keywordSet.forEach(keyword => {
        score += allWords.filter(word => word.includes(keyword)).length
      })
      
      return { ...article, score }
    })
    .filter(article => article.score > 0)
    .sort((a, b) => b.score - a.score)
  
  return scoredArticles.slice(0, limit).map(({ score, ...article }) => article)
}

/**
 * 통합 관련 기사 검색 함수
 * @param {Array} allArticles - 모든 기사 배열
 * @param {Object} currentArticle - 현재 기사 객체
 * @param {string} strategy - 검색 전략 ('category', 'random', 'keywords')
 * @param {number} limit - 반환할 기사 수 (기본값: 3)
 * @returns {Array} 관련 기사 배열
 */
export function getRelatedArticles(allArticles, currentArticle, strategy = 'category', limit = 3) {
  switch (strategy) {
    case 'random':
      return getRandomRelatedArticles(allArticles, currentArticle.id, limit)
    case 'keywords':
      // 키워드 추출 (간단한 구현)
      const keywords = extractKeywords(currentArticle.title + ' ' + currentArticle.summary)
      return getRelatedArticlesByKeywords(allArticles, keywords, currentArticle.id, limit)
    case 'category':
    default:
      return getRelatedArticlesByCategory(allArticles, currentArticle.category, currentArticle.id, limit)
  }
}

/**
 * 텍스트에서 키워드를 추출합니다 (간단한 구현)
 * @param {string} text - 분석할 텍스트
 * @returns {Array} 키워드 배열
 */
function extractKeywords(text) {
  // 간단한 키워드 추출 로직
  const stopWords = ['이', '가', '을', '를', '의', '에', '에서', '로', '으로', '와', '과', '도', '는', '은', '이', '가', '을', '를', '의', '에', '에서', '로', '으로', '와', '과', '도', '는', '은']
  const words = text.toLowerCase().split(/\s+/)
  return words
    .filter(word => word.length > 1 && !stopWords.includes(word))
    .slice(0, 5) // 상위 5개 키워드만 사용
} 