/**
 * ⚠️ 서버 전용 - 클라이언트에서 import 금지 ⚠️
 * 
 * 이 파일은 Next.js API Route에서만 사용되어야 합니다.
 * 클라이언트 코드에서는 newsletterService.js를 사용하세요.
 * 
 * 용도: 백엔드 API 호출 전용 유틸리티
 * 사용처: app/(api)/api/newsletters/ 디렉토리의 route.js 파일들 (BFF)
*/    

import { NewsletterContent } from '../types/newsletter'

export class NewsletterContentService {
  constructor() {
    // 서버 전용 환경변수 사용 (브라우저에 노출되지 않음)
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000'
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
