import { NewsletterContent } from './types/newsletter'

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
          }
        ]
      }

      // 클라이언트 사이드에서는 API 호출
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/newsletters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 목록 조회 실패:', error)
      // API 호출 실패 시 기본 데이터 반환
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
        }
      ]
    }
  },

  // 뉴스레터 구독
  async subscribeNewsletter(newsletterId, email) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/newsletters/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
          email,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('뉴스레터 구독 실패:', error)
      throw error
    }
  },

  // 뉴스레터 구독 해제
  async unsubscribeNewsletter(newsletterId) {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/newsletters/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
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
      const response = await fetch(`${baseUrl}/api/newsletters/user-subscriptions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('사용자 구독 목록 조회 실패:', error)
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

}