import { NewsletterContent } from './types/newsletter'
import NewsletterContentService from '@/lib/services/NewsletterContentService'

// 뉴스레터 관련 API 서비스
export const newsletterService = {
  // 뉴스레터 목록 조회
  async getNewsletters() {
    try {
      const response = await fetch('/api/newsletters', {
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
      throw error
    }
  },

  // 뉴스레터 구독
  async subscribeNewsletter(newsletterId, email) {
    try {
      const response = await fetch('/api/newsletters/subscribe', {
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
      const response = await fetch('/api/newsletters/unsubscribe', {
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
      const response = await fetch('/api/newsletters/user-subscriptions', {
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

      const response = await fetch('/api/newsletters/content', {
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

      const response = await fetch('/api/newsletters/email', {
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

      const response = await fetch(`/api/newsletters/email?${queryParams.toString()}`, {
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

  // 로컬에서 뉴스레터 콘텐츠 생성 (API 호출 없이)
  async generateLocalNewsletterContent(options = {}) {
    try {
      const {
        newsletterId = Date.now(),
        category,
        personalized = false,
        userId,
        limit = 5
      } = options

      if (personalized && userId) {
        return await newsletterContentService.buildPersonalizedContent(
          newsletterId,
          userId,
          { category, limit }
        )
      } else {
        return await newsletterContentService.buildContent(
          newsletterId,
          { personalized, userId, category, limit }
        )
      }
    } catch (error) {
      console.error('로컬 뉴스레터 콘텐츠 생성 실패:', error)
      throw error
    }
  }
}
