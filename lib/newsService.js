// 뉴스 데이터 관리 서비스 - BFF(Backend for Frontend) 패턴 적용
import { authenticatedFetch } from "./auth";

// 뉴스 카테고리 상수 (백엔드 Category enum과 일치)
export const NEWS_CATEGORIES = {
  ALL: "전체",
  POLITICS: "정치",
  ECONOMY: "경제",
  SOCIETY: "사회",
  LIFE: "생활",
  INTERNATIONAL: "세계",
  IT_SCIENCE: "IT/과학",
  VEHICLE: "자동차/교통",
  TRAVEL_FOOD: "여행/음식",
  ART: "예술",
};

// 카테고리 아이콘 매핑 (백엔드 Category enum과 일치)
export const CATEGORY_ICONS = {
  POLITICS: "🏛️",
  ECONOMY: "💰",
  SOCIETY: "👥",
  LIFE: "🎭",
  INTERNATIONAL: "🌍",
  IT_SCIENCE: "💻",
  VEHICLE: "🚗",
  TRAVEL_FOOD: "🧳",
  ART: "🎨",
};

// 한글 표시명을 ENUM으로 보정
const KO_TO_ENUM = {
  정치: "POLITICS",
  경제: "ECONOMY",
  사회: "SOCIETY",
  생활: "LIFE",
  세계: "INTERNATIONAL",
  "IT/과학": "IT_SCIENCE",
  "자동차/교통": "VEHICLE",
  "여행/음식": "TRAVEL_FOOD",
  예술: "ART",
};

export function normalizeType(raw) {
  if (!raw) return "DEFAULT";
  const m = {
    정치: "POLITICS",
    경제: "ECONOMY",
    사회: "SOCIETY",
    생활: "LIFE",
    세계: "INTERNATIONAL",
    "IT/과학": "IT_SCIENCE",
    "자동차/교통": "VEHICLE",
    "여행/음식": "TRAVEL_FOOD",
    예술: "ART",
  };
  const s = String(raw).trim();
  if (m[s]) return m[s];
  return s.toUpperCase().replace(/[- /]/g, "_");
}

/**
 * 뉴스 아이템 기본 구조
 */
export const createNewsItem = (data) => {
  // data가 유효한 객체인지 확인합니다.
  if (!data || typeof data !== "object") {
    console.error("Invalid data provided to createNewsItem:", data);
    return null;
  }
  return {
    id: data.id || data.newsId || Date.now(), // newsId를 우선으로 사용하거나, id가 없으면 Date.now()를 사용합니다.
    title: data.title || "",
    summary: data.summary || data.content?.substring(0, 200) || "",
    content: data.content || "",
    category: data.category || data.categoryName || NEWS_CATEGORIES.ALL,
    source: data.source || data.press || "",
    author: data.author || data.reporterName || "",
    publishedAt: data.publishedAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    views: data.views || 0,
    likes: data.likes || 0,
    image: data.image || data.imageUrl || "/placeholder.svg",
    tags: data.tags || [],
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    isFeatured: data.isFeatured || false,
    ...data,
  };
};

/**
 * 뉴스 데이터 관리 클래스
 */
class NewsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5분
  }

  /**
   * [요약] ID 기반 요약 (DB 캐시 우선)
   * @param {number|string} newsId
   * @param {{type?:string, lines?:number, prompt?:string, force?:boolean}} options
   * @returns {Promise<{newsId:number, type:string, lines:number, summary:string, cached:boolean, createdAt:string}>}
   */
  async summarizeById(newsId, { type, lines = 3, prompt, force } = {}) {
    const typeEnum = normalizeType(type || "DEFAULT");
    try {
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(`/api/news/${newsId}/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: typeEnum, lines, prompt, force }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("401 Unauthorized");
        throw new Error(`${response.status} ${await response.text()}`);
      }

      const result = await response.json();
      return result.success && result.data ? result.data : result;
    } catch (error) {
      console.error("요약 생성 실패:", error);
      throw error;
    }
  }

  /**
   * [요약] 텍스트 임시 요약 (DB 저장 안 함)
   * @param {{text:string, type?:string, lines?:number, prompt?:string}} payload
   * @returns {Promise<string | {summary:string}>>}  // 서버 구현에 따라 TEXT 또는 JSON
   */
  async summarizeText(payload) {
    const { text, type, lines = 3, prompt = null } = payload || {};
    if (!text || !text.trim()) throw new Error("text is required");
    const typeEnum = normalizeType(type || "DEFAULT");

    try {
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(`/api/news/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, type: typeEnum, lines, prompt }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success && result.data ? result.data : result;
    } catch (error) {
      console.error("텍스트 요약 실패:", error);
      throw error;
    }
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(`/api/news?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ API 응답 데이터:", data);

      // API 라우트 응답 구조에 맞게 처리
      if (data.success && data.data) {
        const newsItems = data.data.content
          ? data.data.content.map((item) => ({
              id: item.newsId,
              title: item.title,
              summary: item.summary || item.content?.substring(0, 200) + "...",
              content: item.content,
              category: item.categoryName,
              source: item.press,
              author: item.reporterName,
              publishedAt: item.publishedAt,
              updatedAt: item.updatedAt,
              views: 0,
              likes: 0,
              image: item.imageUrl || "/placeholder.svg",
              tags: [],
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
          totalElements: data.data.totalElements,
          totalPages: data.data.totalPages,
          currentPage: data.data.number + 1,
          size: data.data.size,
          first: data.data.first,
          last: data.data.last,
        };

        this.setCachedData(cacheKey, result);
        return result;
      }

      // 기본 구조로 처리
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
            views: 0,
            likes: 0,
            image: item.imageUrl || "/placeholder.svg",
            tags: [],
            isPublished: true,
            isFeatured: false,
            link: item.link,
            trusted: item.trusted === 1,
            dedupState: item.dedupState,
            dedupStateDescription: item.dedupStateDescription,
            oidAid: item.oidAid,
          }))
        : [];

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
      console.error("❌ 뉴스 목록 조회 실패:", error);
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const categoryParam =
        category === "전체" ? "" : `category=${encodeURIComponent(category)}&`;
      const response = await fetch(
        `/api/news?${categoryParam}page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 라우트 응답 구조에 맞게 처리
      if (data.success && data.data) {
        const newsItems = data.data.content
          ? data.data.content.map((item) => ({
              id: item.newsId,
              title: item.title,
              summary: item.summary || item.content?.substring(0, 200) + "...",
              content: item.content,
              category: item.categoryName,
              source: item.press,
              author: item.reporterName,
              publishedAt: item.publishedAt,
              updatedAt: item.updatedAt,
              views: 0,
              likes: 0,
              image: item.imageUrl || "/placeholder.svg",
              tags: [],
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
          totalElements: data.data.totalElements,
          totalPages: data.data.totalPages,
          currentPage: data.data.number + 1,
          size: data.data.size,
          first: data.data.first,
          last: data.data.last,
        };

        this.setCachedData(cacheKey, result);
        return result;
      }

      // 기본 구조로 처리
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
            views: 0,
            likes: 0,
            image: item.imageUrl || "/placeholder.svg",
            tags: [],
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
      console.error("❌ 카테고리별 뉴스 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 특정 뉴스 기사를 가져옵니다
   * @param {string|number} id - 뉴스 ID
   * @param {boolean} recordView - 읽기 기록 저장 여부 (기본값: false)
   */
  async getNewsById(id, recordView = false) {
    const cacheKey = `news-${id}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      // 캐시된 데이터를 사용할 때도 읽기 기록은 선택적으로 저장
      if (recordView && typeof window !== "undefined") {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          this.recordNewsView(id).catch((err) => {
            console.error("Failed to record news view in background:", err);
          });
        }
      }
      return cached;
    }

    try {
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(`/api/news/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const status = response.status;
        let bodyText = "";
        try {
          bodyText = await response.text();
        } catch (e) {
          /* ignore */
        }
        const err = new Error(bodyText || `HTTP error! status: ${status}`);
        err.status = status;
        throw err;
      }

      const data = await response.json();

      if (!data) {
        console.error("API returned no data for news ID:", id);
        return null;
      }

      // API 라우트 응답 구조 처리
      const newsData = data.success && data.data ? data.data : data;

      // `newsData` 객체 자체를 createNewsItem으로 전달합니다.
      const newsItem = createNewsItem(newsData);

      // newsItem이 유효한지 다시 한번 확인합니다.
      if (!newsItem) {
        console.error(
          "Failed to create a valid news item from API response:",
          newsData
        );
        return null;
      }

      this.setCachedData(cacheKey, newsItem);

      // 읽기 기록 저장은 선택적으로만 수행
      if (recordView && typeof window !== "undefined") {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          // 사용자가 뉴스를 조회했으므로, 조회 기록을 서버에 보냅니다.
          this.recordNewsView(id).catch((err) => {
            console.error("Failed to record news view in background:", err);
          });
        } else {
          console.log("🔍 비로그인 사용자 - 읽기 기록 저장 생략");
        }
      }

      return newsItem;
    } catch (error) {
      // 403(접근 제한)는 정상적 흐름일 수 있으므로 에러 레벨 로그를 남기지 않음
      const status = error?.status || (error?.response && error.response.status) || 500;
      if (status !== 403) {
        console.error(`Error fetching news by ID ${id}:`, error);
      } else {
        console.info(`Access restricted for news ID ${id} (403):`, error?.message || "접근 제한됨");
      }
      // Rethrow so callers can handle specific HTTP statuses (e.g., 403) properly.
      throw error;
    }
  }

  /**
   * 사용자가 조회한 뉴스 기록을 저장합니다.
   * @param {string} newsId - 조회한 뉴스의 ID
   */
  async recordNewsView(newsId) {
    if (!newsId) {
      console.warn("newsId is required to record news view");
      return;
    }

    // 로그인 상태 확인
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        console.log("🔍 비로그인 사용자 - 읽기 기록 저장 생략");
        return null;
      }
    }

    try {
      // Next.js API 라우트를 호출 (백엔드 직접 호출 대신)
      const fullUrl = `/api/users/mypage/history/${newsId}`;
      console.log("🔄 뉴스 조회 기록 저장 요청:", fullUrl);

      const res = await authenticatedFetch(fullUrl, { method: "POST" });

      // 1) fetch Response 인 경우
      if (res && typeof res.json === "function") {
        console.log("📡 API 응답 상태:", res.status, res.statusText);

        if (res.ok) {
          const data = await res.json().catch(() => null);
          console.log("✅ 뉴스 조회 기록 저장 성공:", data);
          return data;
        } else {
          let errBody = null;
          try {
            errBody = await res.json();
          } catch (parseError) {
            console.warn("에러 응답 파싱 실패:", parseError);
            errBody = { message: "서버에서 에러 응답을 파싱할 수 없습니다." };
          }
          
          // 500 에러인 경우 백엔드 API 미구현으로 간주하고 조용히 처리
          if (res.status === 500) {
            console.warn("⚠️ 백엔드 API 미구현 또는 서버 오류 - 뉴스 조회 기록 저장을 건너뜁니다:", errBody);
            return null;
          }
          
          // 401 에러는 인증 문제이므로 조용히 처리
          if (res.status === 401) {
            console.log("🔐 인증 필요 - 뉴스 조회 기록 저장을 건너뜁니다");
            return null;
          }
          
          // 기타 에러는 로그 출력
          console.error(`❌ API 응답 오류 [${res.status}]:`, errBody);
        }
        return null;
      }

      // 2) 이미 파싱된 JSON(혹은 커스텀 객체) 이 반환된 경우
      if (res == null) {
        console.warn(
          "recordNewsView: no response returned from authenticatedFetch"
        );
        return null;
      }

      // 커스텀 형태 { ok, status, data } 지원
      if (typeof res === "object" && ("ok" in res || "status" in res)) {
        if (res.ok === false && res.status !== 401) {
          console.error("❌ API 응답 오류:", res);
          return null;
        }
        console.log("✅ 뉴스 조회 기록 저장 성공:", res.data ?? res);
        return res.data ?? res;
      }

      // 그 외엔 '이미 파싱된 JSON'으로 간주
      console.log("✅ 뉴스 조회 기록 저장 성공:", res);
      return res;
    } catch (error) {
      console.error("Error recording news view:", error);
      return null;
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(
        `/api/news/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 라우트 응답 구조에 맞게 처리
      const responseData = data.success && data.data ? data.data : data;

      // 백엔드 응답 구조에 맞게 변환
      const searchResults = responseData.content
        ? responseData.content.map((item) => ({
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      // 백엔드 API 스펙: /api/news/related/{id}?limit={limit}
      const response = await fetch(
        `/api/news/related/${currentId}?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.warn(`관련 뉴스 조회 실패 (${response.status}): ${currentId}`);
        return [];
      }

      const data = await response.json();
      console.log("🔗 관련 뉴스 API 응답:", data);

      // API 라우트 응답 구조에 맞게 처리
      const responseData = data.success && data.data ? data.data : data;

      // 배열인지 확인
      if (!Array.isArray(responseData)) {
        console.warn("관련 뉴스 응답이 배열이 아닙니다:", responseData);
        return [];
      }

      // 백엔드 응답 구조에 맞게 변환
      const relatedItems = responseData.map((item) => ({
        id: item.newsId || item.id,
        newsId: item.newsId || item.id, // RelatedNewsCard에서 사용
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
        imageUrl: item.imageUrl || "/placeholder.svg", // RelatedNewsCard에서 사용
        tags: item.tags || [],
        isPublished: true,
        isFeatured: false,
        link: item.link,
        trusted: item.trusted,
        dedupState: item.dedupState,
        dedupStateDescription: item.dedupStateDescription,
        oidAid: item.oidAid,
      }));

      console.log("✅ 변환된 관련 뉴스:", relatedItems);
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(`/api/news/${id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        console.log("✅ 조회수 증가 성공:", data);
        return data;
      } else {
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch(`/api/news/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch("/api/news/trending", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 라우트 응답 구조에 맞게 처리
      const responseData = data.success && data.data ? data.data : data;

      // 백엔드 응답 구조에 맞게 변환
      const newsItems = responseData.content
        ? responseData.content.map((item) => ({
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch("/api/news/latest", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 라우트 응답 구조에 맞게 처리
      const responseData = data.success && data.data ? data.data : data;

      // 백엔드 응답 구조에 맞게 변환
      const newsItems = responseData.content
        ? responseData.content.map((item) => ({
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
      // Next.js API 라우트를 통해 호출 (BFF 패턴)
      const response = await fetch("/api/news/popular", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // API 라우트 응답 구조에 맞게 처리
      const responseData = data.success && data.data ? data.data : data;

      // 백엔드 응답 구조에 맞게 변환
      const newsItems = responseData.content
        ? responseData.content.map((item) => ({
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
  getNewsById: (id, recordView = false) =>
    newsService.getNewsById(id, recordView),
  searchNews: (query) => newsService.searchNews(query),
  getRelatedArticles: (currentId, category) =>
    newsService.getRelatedArticles(currentId, category),
  getTrendingNews: () => newsService.getTrendingNews(),
  getLatestNews: () => newsService.getLatestNews(),
  getPopularNews: () => newsService.getPopularNews(),
};
