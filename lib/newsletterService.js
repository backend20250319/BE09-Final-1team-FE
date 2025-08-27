import { NewsletterContent } from './types/newsletter'
import NewsletterContentService from '@/lib/services/NewsletterContentService'

// 뉴스레터 관련 API 서비스
export const newsletterService = {
  // 뉴스레터 목록 조회
  async getNewsletters() {
    try {
      // 임시로 더미 데이터 반환 (백엔드 API가 준비될 때까지)
      return [
        {
          id: 1,
          title: "정치 뉴스레터",
          description: "정치 분야의 주요 뉴스를 매일 전해드립니다.",
          category: "정치",
          frequency: "매일",
          tags: ["정치", "국회", "정부"],
          subscribers: 1250,
          lastSent: "2024-01-15",
          image: "/images/politics.jpg"
        },
        {
          id: 2,
          title: "경제 뉴스레터",
          description: "경제 동향과 시장 분석을 제공합니다.",
          category: "경제",
          frequency: "매일",
          tags: ["경제", "주식", "부동산"],
          subscribers: 2100,
          lastSent: "2024-01-15",
          image: "/images/economy.jpg"
        },
        {
          id: 3,
          title: "IT/과학 뉴스레터",
          description: "최신 기술 트렌드와 과학 소식을 전해드립니다.",
          category: "IT/과학",
          frequency: "주 3회",
          tags: ["IT", "과학", "기술"],
          subscribers: 1800,
          lastSent: "2024-01-14",
          image: "/images/tech.jpg"
        },
        {
          id: 4,
          title: "사회 뉴스레터",
          description: "사회 이슈와 사람들의 이야기를 담습니다.",
          category: "사회",
          frequency: "매일",
          tags: ["사회", "이슈", "사람"],
          subscribers: 950,
          lastSent: "2024-01-15",
          image: "/images/society.jpg"
        },
        {
          id: 5,
          title: "생활 뉴스레터",
          description: "일상생활에 유용한 정보를 제공합니다.",
          category: "생활",
          frequency: "주 2회",
          tags: ["생활", "건강", "요리"],
          subscribers: 1200,
          lastSent: "2024-01-13",
          image: "/images/lifestyle.jpg"
        },
        {
          id: 6,
          title: "세계 뉴스레터",
          description: "세계 각국의 주요 뉴스를 전해드립니다.",
          category: "세계",
          frequency: "매일",
          tags: ["세계", "국제", "외교"],
          subscribers: 800,
          lastSent: "2024-01-15",
          image: "/images/world.jpg"
        }
      ]
    } catch (error) {
      console.error('뉴스레터 목록 조회 실패:', error)
      throw error
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

  // 백엔드 API를 통한 뉴스레터 콘텐츠 생성
  async generateLocalNewsletterContent(options = {}) {
    try {
      const {
        newsletterId = Date.now(),
        category,
        personalized = false,
        userId,
        limit = 5
      } = options

      const contentService = new NewsletterContentService()

      if (personalized && userId) {
        return await contentService.buildPersonalizedContent(
          newsletterId,
          userId,
          { category, limit }
        )
      } else {
        return await contentService.buildContent(
          newsletterId,
          { personalized, userId, category, limit }
        )
      }
    } catch (error) {
      console.error('뉴스레터 콘텐츠 생성 실패:', error)
      throw error
    }
  }
}
