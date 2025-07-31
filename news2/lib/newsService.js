// 뉴스 데이터 관리 서비스
import { newsArticles, NEWS_CATEGORIES } from "./news-data"

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

    // 로컬 데이터 사용
    const newsItems = newsArticles.map(createNewsItem)
    this.setCachedData(cacheKey, newsItems)
    return newsItems
  }

  /**
   * 카테고리별 뉴스를 가져옵니다
   */
  async getNewsByCategory(category, options = {}) {
    const cacheKey = `news-category-${category}-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    // 로컬 데이터 사용
    const filteredNews = newsArticles.filter(item => 
      category === NEWS_CATEGORIES.ALL || item.category === category
    ).map(createNewsItem)
    
    this.setCachedData(cacheKey, filteredNews)
    return filteredNews
  }

  /**
   * 특정 뉴스 기사를 가져옵니다
   */
  async getNewsById(id) {
    const cacheKey = `news-${id}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    // 로컬 데이터 사용
    const newsItem = newsArticles.find(item => item.id === Number(id))
    if (newsItem) {
      const createdItem = createNewsItem(newsItem)
      this.setCachedData(cacheKey, createdItem)
      return createdItem
    }
    return null
  }

  /**
   * 뉴스 기사를 검색합니다
   */
  async searchNews(query, options = {}) {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    // 로컬 데이터 사용
    const searchResults = newsArticles.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.summary.toLowerCase().includes(query.toLowerCase())
    ).map(createNewsItem)
    
    this.setCachedData(cacheKey, searchResults)
    return searchResults
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
    // 로컬에서는 조회수 증가 로직을 구현하지 않음
    console.log(`조회수 증가: ${id}`)
  }

  /**
   * 뉴스 기사 좋아요를 토글합니다
   */
  async toggleLike(id) {
    // 로컬에서는 좋아요 토글 로직을 구현하지 않음
    console.log(`좋아요 토글: ${id}`)
    return { success: true }
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
  getRelatedArticles: (currentId, category) => newsService.getRelatedArticles(currentId, category)
} 