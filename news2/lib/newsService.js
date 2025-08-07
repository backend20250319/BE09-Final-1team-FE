// 뉴스 데이터 관리 서비스
import { newsArticles, NEWS_CATEGORIES } from "./news-data";

// 카테고리 변환 매핑
const CATEGORY_MAPPING = {
  // 프론트엔드 -> 백엔드
  frontendToBackend: {
    정치: "POLITICS",
    경제: "ECONOMY",
    사회: "SOCIETY",
    "생활/문화": "CULTURE",
    세계: "INTERNATIONAL",
    "IT/과학": "IT_SCIENCE",
    전체: "ALL",
  },
  // 백엔드 -> 프론트엔드
  backendToFrontend: {
    POLITICS: "정치",
    ECONOMY: "경제",
    SOCIETY: "사회",
    CULTURE: "생활/문화",
    INTERNATIONAL: "세계",
    IT_SCIENCE: "IT/과학",
  },
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
    const cacheKey = `all-news-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출 시도
      const { page = 0, size = 1000 } = options;
      const response = await fetch(
        `http://localhost:8083/news-service/api/news?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const backendData = await response.json();
        console.log("백엔드에서 받은 전체 뉴스 데이터:", backendData);

        // 백엔드 응답이 페이지네이션 형태인지 확인
        const newsItems = Array.isArray(backendData)
          ? backendData
          : backendData.content || [];

        const transformedNews = newsItems.map((item) =>
          createNewsItem({
            id: item.newsId,
            title: item.title,
            content: item.content,
            category:
              CATEGORY_MAPPING.backendToFrontend[item.categoryName] ||
              CATEGORY_MAPPING.backendToFrontend[item.categoryDescription] ||
              item.categoryName ||
              item.categoryDescription,
            source: item.press,
            author: item.reporter,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            views: item.views || 0,
            summary: item.content ? item.content.substring(0, 200) + "..." : "",
            image: "/placeholder.svg", // 기본 이미지 설정
            // 백엔드 전용 필드들
            newsId: item.newsId,
            reporter: item.reporter,
            press: item.press,
            dedupState: item.dedupState,
            dedupStateDescription: item.dedupStateDescription,
          })
        );

        console.log("변환된 뉴스 데이터:", transformedNews);
        this.setCachedData(cacheKey, transformedNews);
        return transformedNews;
      }
    } catch (error) {
      console.error("백엔드 API 호출 실패:", error);
    }

    // 백엔드 실패 시 로컬 데이터 사용
    console.log("로컬 데이터 사용");
    const newsItems = newsArticles.map(createNewsItem);
    this.setCachedData(cacheKey, newsItems);
    return newsItems;
  }

  /**
   * 카테고리별 뉴스를 가져옵니다
   */
  async getNewsByCategory(category, options = {}) {
    const cacheKey = `news-category-${category}-${JSON.stringify(options)}`;
    // 캐시 비활성화하여 실시간 데이터 확인
    // const cached = this.getCachedData(cacheKey);
    // if (cached) return cached;

    try {
      const { page = 0, size = 1000 } = options;

      // 백엔드 카테고리 형식으로 변환
      const backendCategory = CATEGORY_MAPPING.frontendToBackend[category];

      let url;
      if (category === "전체" || category === "ALL" || !backendCategory) {
        // 전체 카테고리이거나 매핑되지 않은 경우 모든 뉴스 가져오기
        url = `http://localhost:8083/news-service/api/news?page=${page}&size=${size}`;
      } else {
        // 특정 카테고리로 백엔드 API 호출
        url = `http://localhost:8083/news-service/api/news/category/${backendCategory}?page=${page}&size=${size}`;
      }

      console.log(`🔍 백엔드 API 호출: ${url}`);
      console.log(
        `📂 요청한 카테고리: ${category} -> ${backendCategory || "ALL"}`
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const backendData = await response.json();
        console.log("📥 백엔드 응답 데이터:", backendData);

        // 백엔드 응답이 페이지네이션 형태인지 확인
        let newsItems = Array.isArray(backendData)
          ? backendData
          : backendData.content || [];

        console.log(`📊 응답 데이터 개수: ${newsItems.length}`);

        // 받은 데이터의 카테고리 확인
        const receivedCategories = newsItems.map((item) => ({
          newsId: item.newsId,
          title: item.title?.substring(0, 50) + "...",
          categoryName: item.categoryName,
          categoryDescription: item.categoryDescription,
        }));
        console.log("📋 받은 데이터의 카테고리 상세:", receivedCategories);

        const transformedNews = newsItems.map((item) =>
          createNewsItem({
            id: item.newsId,
            title: item.title,
            content: item.content,
            category:
              CATEGORY_MAPPING.backendToFrontend[item.categoryName] ||
              CATEGORY_MAPPING.backendToFrontend[item.categoryDescription] ||
              item.categoryName ||
              item.categoryDescription,
            source: item.press,
            author: item.reporter,
            publishedAt: item.publishedAt,
            updatedAt: item.updatedAt,
            views: item.views || 0,
            summary: item.content ? item.content.substring(0, 200) + "..." : "",
            // 백엔드 전용 필드들
            newsId: item.newsId,
            reporter: item.reporter,
            press: item.press,
            dedupState: item.dedupState,
            dedupStateDescription: item.dedupStateDescription,
          })
        );

        console.log(
          "✅ 변환된 뉴스 데이터:",
          transformedNews.map((item) => ({
            id: item.id,
            title: item.title?.substring(0, 50) + "...",
            category: item.category,
          }))
        );

        this.setCachedData(cacheKey, transformedNews);
        return transformedNews;
      } else {
        console.error(
          `❌ 백엔드 API 호출 실패: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("백엔드 카테고리별 뉴스 호출 실패:", error);
    }

    // 백엔드 실패 시 로컬 데이터에서 카테고리 필터링
    console.log("🔄 로컬 데이터에서 카테고리 필터링:", category);
    const allNews = newsArticles.map(createNewsItem);
    const filteredNews =
      category === "전체" || category === "ALL"
        ? allNews
        : allNews.filter((news) => news.category === category);

    console.log(
      "📱 필터링된 로컬 뉴스:",
      filteredNews.map((item) => ({
        id: item.id,
        title: item.title?.substring(0, 50) + "...",
        category: item.category,
      }))
    );
    this.setCachedData(cacheKey, filteredNews);
    return filteredNews;
  }

  /**
   * 특정 뉴스 기사를 가져옵니다
   */
  async getNewsById(id) {
    const cacheKey = `news-${id}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 백엔드 API 호출 시도
      const response = await fetch(
        `http://localhost:8083/news-service/api/news/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const backendData = await response.json();

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const newsItem = createNewsItem({
          id: backendData.newsId,
          title: backendData.title,
          content: backendData.content,
          category:
            CATEGORY_MAPPING.backendToFrontend[backendData.categoryName] ||
            CATEGORY_MAPPING.backendToFrontend[
              backendData.categoryDescription
            ] ||
            backendData.categoryName ||
            backendData.categoryDescription,
          source: backendData.press,
          author: backendData.reporter,
          publishedAt: backendData.publishedAt,
          updatedAt: backendData.updatedAt,
          views: backendData.views || 0,
          summary: backendData.content
            ? backendData.content.substring(0, 200) + "..."
            : "",
          // 백엔드 전용 필드들
          newsId: backendData.newsId,
          reporter: backendData.reporter,
          press: backendData.press,
          dedupState: backendData.dedupState,
          dedupStateDescription: backendData.dedupStateDescription,
        });

        this.setCachedData(cacheKey, newsItem);
        return newsItem;
      }
    } catch (error) {
      console.error("백엔드 API 호출 실패:", error);
    }

    // 백엔드 실패 시 로컬 데이터 사용
    const newsItem = newsArticles.find((item) => item.id === Number(id));
    if (newsItem) {
      const createdItem = createNewsItem(newsItem);
      this.setCachedData(cacheKey, createdItem);
      return createdItem;
    }
    return null;
  }

  /**
   * 뉴스 기사를 검색합니다
   */
  async searchNews(query, options = {}) {
    const cacheKey = `search-${query}-${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // 로컬 데이터 사용
    const searchResults = newsArticles
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase())
      )
      .map(createNewsItem);

    this.setCachedData(cacheKey, searchResults);
    return searchResults;
  }

  /**
   * 관련 뉴스 기사를 가져옵니다
   */
  async getRelatedArticles(currentId, category, limit = 3) {
    return newsArticles
      .filter(
        (article) => article.id !== currentId && article.category === category
      )
      .slice(0, limit)
      .map(createNewsItem);
  }

  /**
   * 뉴스 기사 조회수를 증가시킵니다
   */
  async incrementViews(id) {
    // 로컬에서는 조회수 증가 로직을 구현하지 않음
    console.log(`조회수 증가: ${id}`);
  }

  /**
   * 뉴스 기사 좋아요를 토글합니다
   */
  async toggleLike(id) {
    // 로컬에서는 좋아요 토글 로직을 구현하지 않음
    console.log(`좋아요 토글: ${id}`);
    return { success: true };
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
};

// 카테고리 매핑을 외부에서 사용할 수 있도록 export
export { CATEGORY_MAPPING };
