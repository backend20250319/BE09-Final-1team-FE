// 뉴스 데이터 관리 서비스
import { newsArticles, NEWS_CATEGORIES } from "./news-data"
import { getApiUrl } from "./config"
import { safeApiCall, diagnoseCorsIssue } from "./api-utils"

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
      // 백엔드 연결 강제 비활성화 (개발용)
      if (process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true') {
        throw new Error('더미 데이터 사용 모드')
      }
      
      // CORS 문제 진단 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        await diagnoseCorsIssue()
      }
      
      // 안전한 API 호출
      const data = await safeApiCall('/api/news')
      
      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content ? data.content.map(item => ({
        id: item.newsId || item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 200) + '...',
        content: item.content,
        category: item.categoryName || item.category,
        source: item.press || item.source,
        author: item.reporterName || item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
        link: item.link,
        trusted: item.trusted,
        dedupState: item.dedupState,
        dedupStateDescription: item.dedupStateDescription,
        oidAid: item.oidAid
      })) : []

      console.log('✅ 변환된 뉴스 아이템:', newsItems.length, '개')
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('❌ 뉴스 데이터 로딩 실패:', error)
      
      // 백엔드 API 실패 시 로컬 데이터 사용
      console.log('🔄 로컬 데이터로 폴백')
      const newsItems = newsArticles.map(createNewsItem)
      this.setCachedData(cacheKey, newsItems)
      return newsItems
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
      // 백엔드 API 호출
      const categoryParam = category === "전체" ? "" : `?category=${category}`
      const response = await fetch(getApiUrl(`/api/news${categoryParam}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content ? data.content.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 100) + '...',
        content: item.content,
        category: item.category,
        source: item.press || item.source,
        author: item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
      })) : []

      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('카테고리별 뉴스 로딩 실패:', error)
      // 백엔드 API 실패 시 로컬 데이터 사용
      const filteredNews = newsArticles.filter(item => 
        category === NEWS_CATEGORIES.ALL || item.category === category
      ).map(createNewsItem)
      
      this.setCachedData(cacheKey, filteredNews)
      return filteredNews
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
      // 백엔드 API 호출
      const response = await fetch(getApiUrl(`/api/news/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const item = await response.json()
      
      // 백엔드 응답 구조에 맞게 변환
      const newsItem = {
        id: item.newsId || item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 200) + '...',
        content: item.content,
        category: item.categoryName || item.category,
        source: item.press || item.source,
        author: item.reporterName || item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
        link: item.link,
        trusted: item.trusted,
        dedupState: item.dedupState,
        dedupStateDescription: item.dedupStateDescription,
        oidAid: item.oidAid
      }

      this.setCachedData(cacheKey, newsItem)
      return newsItem
    } catch (error) {
      console.error('뉴스 상세 로딩 실패:', error)
      // 백엔드 API 실패 시 로컬 데이터 사용
      const newsItem = newsArticles.find(item => item.id === Number(id))
      if (newsItem) {
        const createdItem = createNewsItem(newsItem)
        this.setCachedData(cacheKey, createdItem)
        return createdItem
      }
      return null
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
      // 백엔드 API 호출
      const response = await fetch(getApiUrl(`/api/news/search?query=${encodeURIComponent(query)}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 백엔드 응답 구조에 맞게 변환
      const searchResults = data.content ? data.content.map(item => ({
        id: item.newsId || item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 200) + '...',
        content: item.content,
        category: item.categoryName || item.category,
        source: item.press || item.source,
        author: item.reporterName || item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
        link: item.link,
        trusted: item.trusted,
        dedupState: item.dedupState,
        dedupStateDescription: item.dedupStateDescription,
        oidAid: item.oidAid
      })) : []

      this.setCachedData(cacheKey, searchResults)
      return searchResults
    } catch (error) {
      console.error('뉴스 검색 실패:', error)
      // 백엔드 API 실패 시 로컬 데이터 사용
      const searchResults = newsArticles.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase())
      ).map(createNewsItem)
      
      this.setCachedData(cacheKey, searchResults)
      return searchResults
    }
  }

  /**
   * 관련 뉴스 기사를 가져옵니다
   */
  async getRelatedArticles(currentId, category, limit = 3) {
    return newsArticles
      .filter(article => article.id !== currentId && article.category === category)
      .slice(0, limit)
      .map(createNewsItem)
  }

  /**
   * 뉴스 기사 조회수를 증가시킵니다
   */
  async incrementViews(id) {
    try {
      // 백엔드 API 호출
      await fetch(getApiUrl(`/api/news/${id}/view`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      // 백엔드 API 호출 (좋아요 기능이 구현되어 있다면)
      const response = await fetch(getApiUrl(`/api/news/${id}/like`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        return { success: true }
      }
      return { success: false }
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      return { success: false }
    }
  }

  /**
   * 트렌딩 뉴스를 가져옵니다
   */
  async getTrendingNews(options = {}) {
    const cacheKey = `trending-news-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // 백엔드 API 호출
      const response = await fetch(getApiUrl('/api/news/trending'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content ? data.content.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 100) + '...',
        content: item.content,
        category: item.category,
        source: item.press || item.source,
        author: item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
      })) : []

      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('트렌딩 뉴스 로딩 실패:', error)
      // 백엔드 API 실패 시 로컬 데이터 사용
      const newsItems = newsArticles.slice(0, 10).map(createNewsItem)
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    }
  }

  /**
   * 최신 뉴스를 가져옵니다
   */
  async getLatestNews(options = {}) {
    const cacheKey = `latest-news-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // 백엔드 API 호출
      const response = await fetch(getApiUrl('/api/news/latest'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content ? data.content.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 100) + '...',
        content: item.content,
        category: item.category,
        source: item.press || item.source,
        author: item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
      })) : []

      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('최신 뉴스 로딩 실패:', error)
      // 백엔드 API 실패 시 로컬 데이터 사용
      const newsItems = newsArticles.slice(0, 10).map(createNewsItem)
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    }
  }

  /**
   * 인기 뉴스를 가져옵니다
   */
  async getPopularNews(options = {}) {
    const cacheKey = `popular-news-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // 백엔드 API 호출
      const response = await fetch(getApiUrl('/api/news/popular'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content ? data.content.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 100) + '...',
        content: item.content,
        category: item.category,
        source: item.press || item.source,
        author: item.author,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        views: item.viewCount || 0,
        likes: item.likes || 0,
        image: item.imageUrl || "/placeholder.svg",
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
      })) : []

      this.setCachedData(cacheKey, newsItems)
      return newsItems
    } catch (error) {
      console.error('인기 뉴스 로딩 실패:', error)
      // 백엔드 API 실패 시 로컬 데이터 사용
      const newsItems = newsArticles.slice(0, 10).map(createNewsItem)
      this.setCachedData(cacheKey, newsItems)
      return newsItems
    }
  }
}

// 싱글톤 인스턴스 생성
export const newsService = new NewsService()

// SWR 훅을 위한 fetcher 함수들
export const newsFetchers = {
  getAllNews: () => newsService.getAllNews(),
  getNewsByCategory: (category) => newsService.getNewsByCategory(category),
  getNewsById: (id) => newsService.getNewsById(id),
  searchNews: (query) => newsService.searchNews(query),
  getRelatedArticles: (currentId, category) => newsService.getRelatedArticles(currentId, category),
  getTrendingNews: () => newsService.getTrendingNews(),
  getLatestNews: () => newsService.getLatestNews(),
  getPopularNews: () => newsService.getPopularNews()
} 