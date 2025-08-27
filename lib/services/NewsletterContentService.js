import { NewsletterContent } from '../types/newsletter'

export class NewsletterContentService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
  }

  // 기본 뉴스레터 콘텐츠 생성 (백엔드 API 호출)
  async buildContent(newsletterId, options = {}) {
    const {
      category,
      personalized = false,
      userId,
      limit = 5
    } = options

    try {
      const response = await fetch(`${this.baseUrl}/api/newsletters/content`, {
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
        return NewsletterContent.fromJSON(result.data)
      } else {
        throw new Error(result.error || '뉴스레터 콘텐츠 생성 실패')
      }
    } catch (error) {
      console.error('뉴스레터 콘텐츠 생성 실패:', error)
      throw error
    }
  }

  // 개인화된 뉴스레터 콘텐츠 생성 (백엔드 API 호출)
  async buildPersonalizedContent(newsletterId, userId, options = {}) {
    const {
      category,
      limit = 5
    } = options

    try {
      const response = await fetch(`${this.baseUrl}/api/newsletters/content/personalized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletterId,
          userId,
          category,
          limit
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return NewsletterContent.fromJSON(result.data)
      } else {
        throw new Error(result.error || '개인화된 뉴스레터 콘텐츠 생성 실패')
      }
    } catch (error) {
      console.error('개인화된 뉴스레터 콘텐츠 생성 실패:', error)
      throw error
    }
  }
}

// 싱글톤 인스턴스 생성
const newsletterContentService = new NewsletterContentService()

export default newsletterContentService
