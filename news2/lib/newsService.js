// 뉴스 데이터 관리 서비스
// 실제 API 연동 시 SWR 또는 RTK Query로 이전 가능

/**
 * 뉴스 데이터 타입 정의
 */
export const NEWS_CATEGORIES = {
  ALL: "전체",
  POLITICS: "정치",
  ECONOMY: "경제", 
  SOCIETY: "사회",
  IT_SCIENCE: "IT/과학",
  SPORTS: "스포츠",
  CULTURE: "문화"
}

/**
 * 뉴스 아이템 기본 구조
 */
export const createNewsItem = (data) => ({
  id: data.id || Date.now(),
  title: data.title || "",
  summary: data.summary || "",
  content: data.content || "",
  category: data.category || NEWS_CATEGORIES.ALL,
  source: data.source || "",
  author: data.author || "",
  publishedAt: data.publishedAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
  views: data.views || 0,
  likes: data.likes || 0,
  image: data.image || "/placeholder.svg",
  tags: data.tags || [],
  isPublished: data.isPublished !== undefined ? data.isPublished : true,
  isFeatured: data.isFeatured || false,
  ...data
})

/**
 * 뉴스 데이터 관리 클래스
 */
class NewsService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5분
  }

  /**
   * 캐시된 데이터를 가져옵니다
   */
  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  /**
   * 데이터를 캐시에 저장합니다
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 모든 뉴스 기사를 가져옵니다
   */
  async getAllNews(options = {}) {
    const cacheKey = `all-news-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // 실제 API 호출 시 이 부분을 수정
      const response = await fetch(`${this.baseUrl}/news`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newsItems = data.map(createNewsItem)
      
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('뉴스 데이터 가져오기 실패:', error)
      // 개발 환경에서는 더미 데이터 반환
      return this.getDummyNews()
    }
  }

  /**
   * 카테고리별 뉴스를 가져옵니다
   */
  async getNewsByCategory(category, options = {}) {
    const cacheKey = `news-category-${category}-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseUrl}/news?category=${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newsItems = data.map(createNewsItem)
      
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('카테고리별 뉴스 가져오기 실패:', error)
      return this.getDummyNews().filter(item => 
        category === NEWS_CATEGORIES.ALL || item.category === category
      )
    }
  }

  /**
   * 특정 뉴스 기사를 가져옵니다
   */
  async getNewsById(id) {
    const cacheKey = `news-${id}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseUrl}/news/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newsItem = createNewsItem(data)
      
      this.setCachedData(cacheKey, newsItem)
      return newsItem
    } catch (error) {
      console.error('뉴스 기사 가져오기 실패:', error)
      return this.getDummyNews().find(item => item.id === id)
    }
  }

  /**
   * 뉴스 기사를 검색합니다
   */
  async searchNews(query, options = {}) {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseUrl}/news/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newsItems = data.map(createNewsItem)
      
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('뉴스 검색 실패:', error)
      return this.getDummyNews().filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  /**
   * 뉴스 기사 조회수를 증가시킵니다
   */
  async incrementViews(id) {
    try {
      await fetch(`${this.baseUrl}/news/${id}/views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    } catch (error) {
      console.error('조회수 증가 실패:', error)
    }
  }

  /**
   * 뉴스 기사 좋아요를 토글합니다
   */
  async toggleLike(id) {
    try {
      const response = await fetch(`${this.baseUrl}/news/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      return { success: false }
    }
  }

  /**
   * 더미 뉴스 데이터 (개발용)
   */
  getDummyNews() {
    return [
      {
        id: 1,
        title: "AI 기술의 급속한 발전, 일자리 시장에 미치는 영향은?",
        summary: "인공지능 기술이 빠르게 발전하면서 다양한 산업 분야에서 변화가 일어나고 있습니다. 전문가들은 새로운 일자리 창출과 기존 업무의 자동화가 동시에 진행될 것으로 전망한다고 밝혔습니다.",
        category: NEWS_CATEGORIES.IT_SCIENCE,
        source: "테크뉴스",
        publishedAt: "2024-01-15T10:00:00Z",
        views: 1234,
        likes: 45,
        image: "/placeholder.svg?height=200&width=300",
        tags: ["AI", "기술", "일자리"]
      },
      {
        id: 2,
        title: "2024년 경제 전망, 전문가들이 예측하는 주요 변화",
        summary: "올해 경제 성장률과 물가 상승률에 대한 전문가들의 분석이 발표되었습니다. 글로벌 경제 불확실성 속에서도 국내 경제는 안정적인 성장세를 유지할 것으로 예상됩니다.",
        category: NEWS_CATEGORIES.ECONOMY,
        source: "경제일보",
        publishedAt: "2024-01-15T08:00:00Z",
        views: 892,
        likes: 32,
        image: "/placeholder.svg?height=200&width=300",
        tags: ["경제", "전망", "정책"]
      },
      {
        id: 3,
        title: "환경보호를 위한 새로운 정책, 시민들의 반응은?",
        summary: "정부가 발표한 새로운 환경보호 정책에 대해 시민들과 환경단체들의 다양한 의견이 제시되고 있습니다. 실효성과 실현 가능성에 대한 논의가 활발히 진행되고 있습니다.",
        category: NEWS_CATEGORIES.SOCIETY,
        source: "환경뉴스",
        publishedAt: "2024-01-15T06:00:00Z",
        views: 567,
        likes: 28,
        image: "/placeholder.svg?height=200&width=300",
        tags: ["환경", "정책", "사회"]
      }
    ].map(createNewsItem)
  }
}

// 싱글톤 인스턴스 생성
export const newsService = new NewsService()

// SWR 훅을 위한 fetcher 함수들
export const newsFetchers = {
  getAllNews: () => newsService.getAllNews(),
  getNewsByCategory: (category) => newsService.getNewsByCategory(category),
  getNewsById: (id) => newsService.getNewsById(id),
  searchNews: (query) => newsService.searchNews(query)
} 