// 뉴스 데이터 관리 서비스
import { safeApiCall, diagnoseCorsIssue } from "./api-utils";
import { getApiUrl } from "./config";

// 뉴스 카테고리 상수
export const NEWS_CATEGORIES = {
  ALL: "전체",
  POLITICS: "정치",
  ECONOMY: "경제",
  SOCIETY: "사회",
  CULTURE: "문화",
  WORLD: "국제",
  SPORTS: "스포츠",
  TECHNOLOGY: "기술",
  ENTERTAINMENT: "연예",
  HEALTH: "건강",
};

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
  ...data,
});

/**
 * 뉴스 데이터 관리 클래스
 */
class NewsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5분
  }

  /**
   * 캐시된 데이터를 가져옵니다
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * 데이터를 캐시에 저장합니다
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 모든 뉴스 기사를 가져옵니다
   */
  async getAllNews(options = {}) {
    const { page = 1, size = 21 } = options;
    const cacheKey = `all-news-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // CORS 문제 진단 (개발 환경에서만)
      if (process.env.NODE_ENV === "development") {
        await diagnoseCorsIssue();
      }

      // 실제 백엔드 API 호출 (중앙 fetch 래퍼 사용)
      const data = await safeApiCall(`/api/news?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 실제 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content
        ? data.content.map((item) => ({
            id: item.newsId,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
            content: item.content,
            category: item.categoryName,
            source: item.press,
            author: item.reporterName,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            views: 0, // 실제 백엔드에는 조회수 필드가 없음
            likes: 0, // 실제 백엔드에는 좋아요 필드가 없음
            image: item.imageUrl || "/placeholder.svg",
            tags: [], // 실제 백엔드에는 태그 필드가 없음
            isPublished: true,
            isFeatured: false,
            link: item.link,
            trusted: item.trusted === 1,
            dedupState: item.dedupState,
            dedupStateDescription: item.dedupStateDescription,
            oidAid: item.oidAid,
          }))
        : [];

      console.log("✅ 변환된 뉴스 아이템:", newsItems.length, "개");

      // 페이지네이션 정보와 함께 반환
      const result = {
        content: newsItems,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number + 1,
        size: data.size,
        first: data.first,
        last: data.last,
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error("❌ 백엔드 API 실패:", error);
      throw error;
    }
  }

  /**
   * 카테고리별 뉴스를 가져옵니다
   */
  async getNewsByCategory(category, options = {}) {
    const { page = 1, size = 21 } = options;
    const cacheKey = `news-category-${category}-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 실제 백엔드 API 호출 (중앙 fetch 래퍼 사용)
      const categoryParam =
        category === "전체" ? "" : `category=${encodeURIComponent(category)}&`;
      const data = await safeApiCall(
        `/api/news?${categoryParam}page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 실제 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content
        ? data.content.map((item) => ({
            id: item.newsId,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
            content: item.content,
            category: item.categoryName,
            source: item.press,
            author: item.reporterName,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            views: 0, // 실제 백엔드에는 조회수 필드가 없음
            likes: 0, // 실제 백엔드에는 좋아요 필드가 없음
            image: item.imageUrl || "/placeholder.svg",
            tags: [], // 실제 백엔드에는 태그 필드가 없음
            isPublished: true,
            isFeatured: false,
            link: item.link,
            trusted: item.trusted === 1,
            dedupState: item.dedupState,
            dedupStateDescription: item.dedupStateDescription,
            oidAid: item.oidAid,
          }))
        : [];

      // 페이지네이션 정보와 함께 반환
      const result = {
        content: newsItems,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number + 1,
        size: data.size,
        first: data.first,
        last: data.last,
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error("❌ 백엔드 API 실패:", error);
      throw error;
    }
  }

  /**
   * 특정 뉴스 기사를 가져옵니다
   */
  async getNewsById(id) {
    const cacheKey = `news-${id}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출
      const item = await safeApiCall(`/api/news/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔍 백엔드 응답 원본:", item);

      // 백엔드 응답 구조에 맞게 변환
      const newsItem = {
        id: item.newsId || item.id,
        title: item.title,
        summary: item.summary || item.content?.substring(0, 200) + "...",
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
        oidAid: item.oidAid,
      };

      console.log("🔄 변환된 뉴스 아이템:", newsItem);

      this.setCachedData(cacheKey, newsItem);
      return newsItem;
    } catch (error) {
      console.error("뉴스 상세 로딩 실패:", error);
      throw error;
    }
  }

  /**
   * 뉴스 기사를 검색합니다
   */
  async searchNews(query, options = {}) {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출
      const data = await safeApiCall(
        `/api/news/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 백엔드 응답 구조에 맞게 변환
      const searchResults = data.content
        ? data.content.map((item) => ({
            id: item.newsId || item.id,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
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
            oidAid: item.oidAid,
          }))
        : [];

      this.setCachedData(cacheKey, searchResults);
      return searchResults;
    } catch (error) {
      console.error("뉴스 검색 실패:", error);
      throw error;
    }
  }

  /**
   * 관련 뉴스 기사를 가져옵니다
   */
  async getRelatedArticles(currentId, category, limit = 3) {
    const cacheKey = `related-${currentId}-${category}-${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출
      const data = await safeApiCall(
        `/api/news/related?currentId=${currentId}&category=${encodeURIComponent(category)}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 백엔드 응답 구조에 맞게 변환
      const relatedItems = data.content
        ? data.content.map((item) => ({
            id: item.newsId || item.id,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
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
            oidAid: item.oidAid,
          }))
        : [];

      this.setCachedData(cacheKey, relatedItems);
      return relatedItems;
    } catch (error) {
      console.error("관련 뉴스 로딩 실패:", error);
      return [];
    }
  }

  /**
   * 뉴스 기사 조회수를 증가시킵니다
   */
  async incrementViews(id) {
    try {
      // 백엔드 API 호출
      const response = await safeApiCall(`/api/news/${id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // 응답이 null이거나 빈 응답인 경우도 성공으로 처리
      if (response === null) {
        console.log("✅ 조회수 증가 성공 (빈 응답)");
      }
    } catch (error) {
      console.error("조회수 증가 실패:", error);
      // 조회수 증가 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    }
  }

  /**
   * 뉴스 기사 좋아요를 토글합니다
   */
  async toggleLike(id) {
    try {
      // 백엔드 API 호출 (좋아요 기능이 구현되어 있다면)
      const response = await safeApiCall(`/api/news/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return { success: true, data: response };
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      return { success: false };
    }
  }

  /**
   * 트렌딩 뉴스를 가져옵니다
   */
  async getTrendingNews(options = {}) {
    const cacheKey = `trending-news-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출
      const data = await safeApiCall("/api/news/trending", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content
        ? data.content.map((item) => ({
            id: item.newsId || item.id,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
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
            oidAid: item.oidAid,
          }))
        : [];

      this.setCachedData(cacheKey, newsItems);
      return newsItems;
    } catch (error) {
      console.error("트렌딩 뉴스 로딩 실패:", error);
      throw error;
    }
  }

  /**
   * 최신 뉴스를 가져옵니다
   */
  async getLatestNews(options = {}) {
    const cacheKey = `latest-news-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출
      const data = await safeApiCall("/api/news/latest", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content
        ? data.content.map((item) => ({
            id: item.newsId || item.id,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
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
            oidAid: item.oidAid,
          }))
        : [];

      this.setCachedData(cacheKey, newsItems);
      return newsItems;
    } catch (error) {
      console.error("최신 뉴스 로딩 실패:", error);
      throw error;
    }
  }

  /**
   * 인기 뉴스를 가져옵니다
   */
  async getPopularNews(options = {}) {
    const cacheKey = `popular-news-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출
      const data = await safeApiCall("/api/news/popular", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 백엔드 응답 구조에 맞게 변환
      const newsItems = data.content
        ? data.content.map((item) => ({
            id: item.newsId || item.id,
            title: item.title,
            summary: item.summary || item.content?.substring(0, 200) + "...",
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
            oidAid: item.oidAid,
          }))
        : [];

      this.setCachedData(cacheKey, newsItems);
      return newsItems;
    } catch (error) {
      console.error("인기 뉴스 로딩 실패:", error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const newsService = new NewsService();

// SWR 훅을 위한 fetcher 함수들
export const newsFetchers = {
  getAllNews: () => newsService.getAllNews(),
  getNewsByCategory: (category) => newsService.getNewsByCategory(category),
  getNewsById: (id) => newsService.getNewsById(id),
  searchNews: (query) => newsService.searchNews(query),
  getRelatedArticles: (currentId, category) =>
    newsService.getRelatedArticles(currentId, category),
  getTrendingNews: () => newsService.getTrendingNews(),
  getLatestNews: () => newsService.getLatestNews(),
  getPopularNews: () => newsService.getPopularNews(),
};