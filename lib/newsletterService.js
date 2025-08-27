import { NewsletterContent } from './types/newsletter'
import { getAuthHeaders } from './auth'

/**
 * 백엔드 데이터를 프론트엔드 형식으로 매핑하는 함수
 */
const mapBackendToFrontend = (backendData) => {
  // 백엔드 카테고리 매핑
  const categoryMapping = {
    'POLITICS': '정치',
    'ECONOMY': '경제', 
    'SOCIETY': '사회',
    'LIFE': '생활',
    'INTERNATIONAL': '세계',
    'IT_SCIENCE': 'IT/과학',
    'VEHICLE': '자동차/교통',
    'TRAVEL_FOOD': '여행/음식',
    'ART': '예술'
  };

  // 프론트엔드 카테고리를 백엔드 형식으로 변환
  const reverseCategoryMapping = Object.fromEntries(
    Object.entries(categoryMapping).map(([key, value]) => [value, key])
  );

  return {
    // 뉴스레터 목록 매핑
    mapNewsletters: (backendNewsletters) => {
      return backendNewsletters.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.description,
        category: categoryMapping[newsletter.category] || newsletter.category,
        frequency: newsletter.frequency,
        subscribers: newsletter.subscriberCount || newsletter.subscribers,
        lastSent: newsletter.lastSentAt ? formatTimeAgo(newsletter.lastSentAt) : newsletter.lastSent,
        tags: newsletter.tags || [],
        isSubscribed: newsletter.isSubscribed || false,
        // 백엔드 원본 데이터 보존
        _backendData: newsletter
      }));
    },

    // 구독 정보 매핑
    mapSubscriptions: (backendSubscriptions) => {
      if (!backendSubscriptions || !Array.isArray(backendSubscriptions)) {
        return [];
      }
      return backendSubscriptions.map(subscription => ({
        id: subscription.id,
        category: categoryMapping[subscription.category] || subscription.category,
        status: subscription.status,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        // 백엔드 원본 데이터 보존
        _backendData: subscription
      }));
    },

    // 카테고리 변환 (프론트엔드 → 백엔드)
    toBackendCategory: (frontendCategory) => {
      return reverseCategoryMapping[frontendCategory] || frontendCategory;
    },

    // 카테고리 변환 (백엔드 → 프론트엔드)
    toFrontendCategory: (backendCategory) => {
      return categoryMapping[backendCategory] || backendCategory;
    }
  };
};

// 시간 포맷팅 함수
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}시간 전`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  }
};

/**
 * 뉴스레터 관련 API 서비스 (클라이언트 전용)
 * 
 * 모든 뉴스레터 관련 작업은 이 서비스를 통해 Next.js API Route를 호출합니다.
 * 직접 백엔드 호출은 하지 않으며, BFF 패턴을 따릅니다.
 */
export const newsletterService = {
  // 뉴스레터 목록 조회
  async getNewsletters() {
    try {
      // 서버 사이드에서는 직접 데이터 반환 (SSR을 위해)
      if (typeof window === 'undefined') {
        return [
          {
            id: 1,
            title: "정치 뉴스 데일리",
            description: "매일 업데이트되는 정치 관련 최신 뉴스를 받아보세요. 국회 소식, 정책 동향, 정치 현안을 한눈에!",
            category: "정치",
            frequency: "매일",
            subscribers: 15420,
            lastSent: "2시간 전",
            tags: ["정치", "국회", "정책", "현안"],
            isSubscribed: false
          },
          {
            id: 2,
            title: "경제 트렌드 위클리",
            description: "주요 경제 지표, 주식 시장 동향, 부동산 소식을 주간으로 정리해서 전달합니다.",
            category: "경제",
            frequency: "주간",
            subscribers: 8920,
            lastSent: "1일 전",
            tags: ["경제", "주식", "부동산", "투자"],
            isSubscribed: false
          },
          {
            id: 3,
            title: "IT/과학 인사이드",
            description: "최신 기술 트렌드, 스타트업 소식, 과학 연구 성과를 깊이 있게 다룹니다.",
            category: "IT/과학",
            frequency: "주 3회",
            subscribers: 12350,
            lastSent: "6시간 전",
            tags: ["IT", "기술", "스타트업", "과학"],
            isSubscribed: false
          },
          {
            id: 4,
            title: "사회 이슈 포커스",
            description: "사회적 이슈와 현안을 다양한 관점에서 분석하고 해석합니다.",
            category: "사회",
            frequency: "매일",
            subscribers: 18760,
            lastSent: "4시간 전",
            tags: ["사회", "이슈", "현안", "분석"],
            isSubscribed: false
          },
          {
            id: 5,
            title: "생활 정보 가이드",
            description: "일상생활에 유용한 정보, 건강, 요리, 쇼핑 팁을 제공합니다.",
            category: "생활",
            frequency: "주 2회",
            subscribers: 6540,
            lastSent: "2일 전",
            tags: ["생활", "건강", "요리", "쇼핑"],
            isSubscribed: false
          },
          {
            id: 6,
            title: "세계 뉴스 브리프",
            description: "전 세계 주요 뉴스와 국제 관계 동향을 간결하게 요약해서 전달합니다.",
            category: "세계",
            frequency: "매일",
            subscribers: 11230,
            lastSent: "3시간 전",
            tags: ["세계", "국제", "외교", "글로벌"],
            isSubscribed: false
          },
          {
            id: 7,
            title: "자동차 & 모빌리티 인사이드",
            description: "전기차, 자율주행, 친환경 모빌리티 등 자동차와 교통 분야의 최신 트렌드를 다룹니다.",
            category: "자동차/교통",
            frequency: "주 3회",
            subscribers: 8750,
            lastSent: "1일 전",
            tags: ["자동차", "전기차", "자율주행", "모빌리티"],
            isSubscribed: false
          },
          {
            id: 8,
            title: "여행 & 푸드 가이드",
            description: "국내외 여행 정보와 맛집 소개, 음식 문화를 다루는 종합 가이드입니다.",
            category: "여행/음식",
            frequency: "주 2회",
            subscribers: 12340,
            lastSent: "2일 전",
            tags: ["여행", "음식", "맛집", "관광"],
            isSubscribed: false
          },
          {
            id: 9,
            title: "아트 & 컬처 스토리",
            description: "영화, 음악, 미술, 문학 등 다양한 예술 분야의 소식과 문화 이벤트를 전합니다.",
            category: "예술",
            frequency: "주 2회",
            subscribers: 6540,
            lastSent: "3일 전",
            tags: ["예술", "문화", "영화", "음악"],
            isSubscribed: false
          }
        ];
      }

      // 클라이언트 사이드에서는 API 호출
      const response = await fetch('/api/newsletters', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 백엔드 데이터가 있으면 매핑하여 반환
      if (data.success && data.data) {
        const mapper = mapBackendToFrontend();
        return mapper.mapNewsletters(data.data);
      }
      
      // 백엔드 데이터가 없으면 기본 데이터 반환
      return data.newsletters || [];
      
    } catch (error) {
      console.error('뉴스레터 목록 조회 실패:', error);
      
      // 에러 발생 시 기본 데이터 반환 (fallback)
      return [
        {
          id: 1,
          title: "정치 뉴스 데일리",
          description: "매일 업데이트되는 정치 관련 최신 뉴스를 받아보세요.",
          category: "정치",
          frequency: "매일",
          subscribers: 15420,
          lastSent: "2시간 전",
          tags: ["정치", "국회", "정책"],
          isSubscribed: false
        }
      ];
    }
  },

  // 뉴스레터 구독 (카테고리 기반)
  async subscribeNewsletter(category, email) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      // 카테고리 매핑 (프론트엔드 → 백엔드)
      const categoryMapping = {
        '정치': 'POLITICS',
        '경제': 'ECONOMY', 
        '사회': 'SOCIETY',
        '생활': 'LIFE',
        '세계': 'INTERNATIONAL',
        'IT/과학': 'IT_SCIENCE',
        '자동차/교통': 'VEHICLE',
        '여행/음식': 'TRAVEL_FOOD',
        '예술': 'ART'
      }

      const backendCategory = categoryMapping[category]
      if (!backendCategory) {
        throw new Error('지원하지 않는 카테고리입니다.')
      }
      
      // 기존 구독 정보 가져오기
      let existingCategories = []
      try {
        const subscriptionsResponse = await fetch(`${baseUrl}/api/newsletters/user-subscriptions`, {
          method: 'GET',
          headers,
        })
        
        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json()
          if (subscriptionsData.success && subscriptionsData.data) {
            // 기존 구독에서 카테고리들 수집
            subscriptionsData.data.forEach(sub => {
              if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
                existingCategories.push(...sub.preferredCategories)
              }
            })
          }
        }
      } catch (error) {
        console.warn('기존 구독 정보 조회 실패:', error)
      }
      
      // 중복 제거
      const uniqueExistingCategories = [...new Set(existingCategories)]
      
      // 이미 구독 중인 카테고리인지 확인
      if (uniqueExistingCategories.includes(backendCategory)) {
        throw new Error('이미 구독 중인 카테고리입니다.')
      }
      
      // 최대 구독 개수 제한 (3개)
      if (uniqueExistingCategories.length >= 3) {
        throw new Error('최대 3개까지 구독할 수 있습니다. 다른 카테고리의 구독을 해제한 후 다시 시도해주세요.')
      }
      
      // 새 카테고리 추가
      const allCategories = [...uniqueExistingCategories, backendCategory]
      
      const requestBody = {
        email,
        frequency: 'DAILY',
        preferredCategories: allCategories
      }
      
      console.log('구독 요청 전송:', {
        url: `${baseUrl}/api/newsletters/subscribe`,
        method: 'POST',
        headers,
        body: requestBody
      })
      
      const response = await fetch(`${baseUrl}/api/newsletters/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 구독 실패:', error)
      throw error
    }
  },

  // 뉴스레터 구독 해제 (카테고리 기반)
  async unsubscribeNewsletter(category) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      // 카테고리 매핑 (프론트엔드 → 백엔드)
      const categoryMapping = {
        '정치': 'POLITICS',
        '경제': 'ECONOMY', 
        '사회': 'SOCIETY',
        '생활': 'LIFE',
        '세계': 'INTERNATIONAL',
        'IT/과학': 'IT_SCIENCE',
        '자동차/교통': 'VEHICLE',
        '여행/음식': 'TRAVEL_FOOD',
        '예술': 'ART'
      }

      const backendCategory = categoryMapping[category]
      if (!backendCategory) {
        throw new Error('지원하지 않는 카테고리입니다.')
      }
      
      // 기존 구독 정보 가져오기
      let targetSubscription = null
      try {
        const subscriptionsResponse = await fetch(`${baseUrl}/api/newsletters/user-subscriptions`, {
          method: 'GET',
          headers,
        })
        
        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json()
          if (subscriptionsData.success && subscriptionsData.data) {
            // 해당 카테고리가 포함된 구독 찾기
            targetSubscription = subscriptionsData.data.find(sub => {
              if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
                return sub.preferredCategories.includes(backendCategory)
              }
              return false
            })
          }
        }
      } catch (error) {
        console.warn('기존 구독 정보 조회 실패:', error)
      }
      
      if (!targetSubscription) {
        throw new Error('해당 카테고리의 구독을 찾을 수 없습니다.')
      }
      
      // 해당 구독의 카테고리에서 제거할 카테고리 빼기
      const remainingCategories = targetSubscription.preferredCategories.filter(cat => cat !== backendCategory)
      
      // 최소 1개 구독 유지 제한
      if (remainingCategories.length === 0) {
        throw new Error('최소 1개의 카테고리는 구독해야 합니다. 다른 카테고리를 먼저 구독한 후 이 카테고리를 해제해주세요.')
      }
      
      // 일부 카테고리만 제거하고 구독 업데이트
      const requestBody = {
        email: targetSubscription.email || 'user@example.com',
        frequency: targetSubscription.frequency || 'DAILY',
        preferredCategories: remainingCategories
      }
      
      console.log('구독 업데이트 요청 전송:', {
        url: `${baseUrl}/api/newsletters/subscribe`,
        method: 'POST',
        headers,
        body: requestBody
      })
      
      const response = await fetch(`${baseUrl}/api/newsletters/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 구독 해제 실패:', error)
      throw error
    }
  },

  // 사용자 구독 목록 조회
  async getUserSubscriptions() {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      const response = await fetch(`${baseUrl}/api/newsletters/user-subscriptions`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API 응답 데이터:', data)
      console.log('data.data:', data.data)
      console.log('data.data || data:', data.data || data)
      const subscriptionsData = data.data || data || []
      return mapBackendToFrontend(data).mapSubscriptions(subscriptionsData)
    } catch (error) {
      console.error('사용자 구독 목록 조회 실패:', error)
      throw error
    }
  },

  // 구독 정보 조회
  async getSubscription(subscriptionId) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      const response = await fetch(`${baseUrl}/api/newsletters/subscription/${subscriptionId}`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('구독 정보 조회 실패:', error)
      throw error
    }
  },

  // 내 구독 목록 조회
  async getMySubscriptions() {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      const response = await fetch(`${baseUrl}/api/newsletters/subscription/my`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const subscriptionsData = data.data || data || []
      return mapBackendToFrontend(data).mapSubscriptions(subscriptionsData)
    } catch (error) {
      console.error('내 구독 목록 조회 실패:', error)
      throw error
    }
  },

  // 활성 구독 목록 조회
  async getActiveSubscriptions() {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      const response = await fetch(`${baseUrl}/api/newsletters/subscription/active`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return mapBackendToFrontend(data).mapSubscriptions(data.data)
    } catch (error) {
      console.error('활성 구독 목록 조회 실패:', error)
      throw error
    }
  },

  // 구독 상태 변경
  async updateSubscriptionStatus(subscriptionId, status) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
      
      const response = await fetch(`${baseUrl}/api/newsletters/subscription/${subscriptionId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('구독 상태 변경 실패:', error)
      throw error
    }
  },

  // 새로운 뉴스레터 콘텐츠 생성 (JSON)
  async generateNewsletterContent(options = {}) {
    try {
      const {
        newsletterId = Date.now(),
        category,
        personalized = false,
        userId,
        limit = 5
      } = options

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/newsletters/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
          category,
          personalized,
          userId,
          limit
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // JSON을 NewsletterContent 객체로 변환
        return NewsletterContent.fromJSON(result.data)
      } else {
        throw new Error(result.error || '뉴스레터 콘텐츠 생성 실패')
      }
    } catch (error) {
      console.error('뉴스레터 콘텐츠 생성 실패:', error)
      throw error
    }
  },

  // 개인화된 뉴스레터 콘텐츠 생성
  async generatePersonalizedNewsletter(userId, options = {}) {
    return this.generateNewsletterContent({
      ...options,
      personalized: true,
      userId
    })
  },

  // 뉴스레터 이메일 HTML 생성
  async generateNewsletterEmail(options = {}) {
    try {
      const {
        newsletterId = Date.now(),
        category,
        personalized = false,
        userId,
        limit = 5,
        includeTracking = true,
        includeUnsubscribe = true,
        theme = 'default',
        format = 'html'
      } = options

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/newsletters/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
          category,
          personalized,
          userId,
          limit,
          includeTracking,
          includeUnsubscribe,
          theme,
          format
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      if (format === 'text') {
        return await response.text()
      } else {
        return await response.text() // HTML 문자열 반환
      }
    } catch (error) {
      console.error('뉴스레터 이메일 생성 실패:', error)
      throw error
    }
  },

  // 뉴스레터 이메일 미리보기 (GET 요청)
  async previewNewsletterEmail(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/newsletters/email?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const format = params.format || 'html'
      if (format === 'text') {
        return await response.text()
      } else {
        return await response.text() // HTML 문자열 반환
      }
    } catch (error) {
      console.error('뉴스레터 이메일 미리보기 실패:', error)
      throw error
    }
  },

  // 카테고리별 기사 조회
  async getCategoryArticles(category, limit = 5) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const response = await fetch(`${baseUrl}/api/newsletters/category/articles?category=${encodeURIComponent(category)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include', // 쿠키 포함
      })
      
      if (!response.ok) {
        console.warn(`카테고리별 기사 조회 실패 (${response.status}): ${category}`)
        // 401 오류나 기타 오류 시 기본 데이터 반환
        return {
          trendingKeywords: [],
          totalArticles: 0,
          articles: [],
          mainTopics: []
        }
      }
      
      const data = await response.json()
      return data.success ? data.data : {
        trendingKeywords: [],
        totalArticles: 0,
        articles: [],
        mainTopics: []
      }
    } catch (error) {
      console.error('카테고리별 기사 조회 실패:', error)
      // 에러 발생 시 기본 데이터 반환
      return {
        trendingKeywords: [],
        totalArticles: 0,
        articles: [],
        mainTopics: []
      }
    }
  },

  // 구독자 통계 조회
  async getSubscriberStats(category = null) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      const url = category 
        ? `${baseUrl}/api/newsletter/stats/subscribers?category=${encodeURIComponent(category)}`
        : `${baseUrl}/api/newsletter/stats/subscribers`
      
      console.log('🔍 구독자 통계 조회 요청:', { category, url })
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include', // 쿠키 포함
      })
      
      if (!response.ok) {
        console.warn(`구독자 통계 조회 실패 (${response.status}): ${category}`)
        // 401 오류나 기타 오류 시 더미 데이터 반환
        return generateDummySubscriberStats(category)
      }
      
      const data = await response.json()
      console.log('✅ 구독자 통계 응답:', data)
      
      // 응답 구조 확인 및 처리
      if (data.success && data.data) {
        return data.data
      } else if (data.data) {
        return data.data
      } else {
        console.warn('구독자 통계 응답 구조가 예상과 다름:', data)
        return generateDummySubscriberStats(category)
      }
    } catch (error) {
      console.error('구독자 통계 조회 실패:', error)
      // 에러 발생 시 더미 데이터 반환
      return generateDummySubscriberStats(category)
    }
  },

  // 카테고리별 헤드라인 조회
  async getCategoryHeadlines(category, limit = 5) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      console.log('🔍 헤드라인 조회 요청:', { category, limit })
      
      const response = await fetch(`${baseUrl}/api/newsletter/category/headlines?category=${encodeURIComponent(category)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include', // 쿠키 포함
      })
      
      if (!response.ok) {
        console.warn(`헤드라인 조회 실패 (${response.status}): ${category}`)
        // 401 오류나 기타 오류 시 빈 배열 반환
        return []
      }
      
      const data = await response.json()
      console.log('✅ 헤드라인 응답:', data)
      
      // 응답 구조 확인 및 처리
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data
      } else if (Array.isArray(data)) {
        return data
      } else if (data.data && Array.isArray(data.data)) {
        return data.data
      } else {
        console.warn('헤드라인 응답 구조가 예상과 다름:', data)
        return []
      }
    } catch (error) {
      console.error('헤드라인 조회 실패:', error)
      // 에러 발생 시 빈 배열 반환
      return []
    }
  },

  // 카테고리별 트렌드 키워드 조회
  async getTrendingKeywords(category, limit = 8) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      console.log('🔍 트렌드 키워드 조회 요청:', { category, limit })
      
      const response = await fetch(`${baseUrl}/api/newsletter/category/trending-keywords?category=${encodeURIComponent(category)}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: 'include', // 쿠키 포함
      })
      
      if (!response.ok) {
        console.warn(`트렌드 키워드 조회 실패 (${response.status}): ${category}`)
        // 401 오류나 기타 오류 시 빈 배열 반환
        return []
      }
      
      const data = await response.json()
      console.log('✅ 트렌드 키워드 응답:', data)
      
      // 응답 구조 확인 및 처리
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data
      } else if (Array.isArray(data)) {
        return data
      } else if (data.data && Array.isArray(data.data)) {
        return data.data
      } else {
        console.warn('트렌드 키워드 응답 구조가 예상과 다름:', data)
        return []
      }
    } catch (error) {
      console.error('트렌드 키워드 조회 실패:', error)
      // 에러 발생 시 빈 배열 반환
      return []
    }
  },

};

// 더미 구독자 통계 생성 함수
function generateDummySubscriberStats(category) {
  const defaultCounts = {
    "정치": 15420,
    "경제": 8920,
    "사회": 18760,
    "생활": 12340,
    "세계": 9870,
    "IT/과학": 12350,
    "자동차/교통": 11230,
    "여행/음식": 14560,
    "예술": 8760
  };

  if (category) {
    return { [category]: defaultCounts[category] || 10000 };
  }

  return defaultCounts;
}

