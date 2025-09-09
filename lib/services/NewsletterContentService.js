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
  async buildContent(newsletterId, options = {}, accessToken = null) {
    const {
      category = '정치',
      personalized = false,
      userId,
      limit = 5
    } = options

    try {
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // 인증 토큰이 있으면 헤더에 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(`${this.baseUrl}/api/newsletter/${newsletterId}/content`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        console.warn('백엔드 API 호출 실패, fallback 데이터 사용:', response.status)
        return this.createFallbackContent(newsletterId, { category, personalized, userId, limit })
      }
      
      const result = await response.json()
      
      if (result.success) {
        return NewsletterContent.fromJSON(result.data)
      } else {
        console.warn('백엔드 응답 실패, fallback 데이터 사용:', result.error)
        return this.createFallbackContent(newsletterId, { category, personalized, userId, limit })
      }
    } catch (error) {
      console.warn('뉴스레터 콘텐츠 생성 실패, fallback 데이터 사용:', error.message)
      return this.createFallbackContent(newsletterId, { category, personalized, userId, limit })
    }
  }

  // 개인화된 뉴스레터 콘텐츠 생성 (백엔드 API 호출)
  async buildPersonalizedContent(newsletterId, userId, options = {}, accessToken = null) {
    const {
      category = '정치',
      limit = 5
    } = options

    try {
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // 인증 토큰이 있으면 헤더에 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      // 쿼리 파라미터로 userId 전달
      const queryParams = new URLSearchParams({
        userId: userId,
        ...(category && { category }),
        limit: limit.toString()
      })

      const response = await fetch(`${this.baseUrl}/api/newsletter/${newsletterId}/content?${queryParams}`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        console.warn('개인화된 백엔드 API 호출 실패, fallback 데이터 사용:', response.status)
        return this.createFallbackContent(newsletterId, { category, personalized: true, userId, limit })
      }
      
      const result = await response.json()
      
      if (result.success) {
        return NewsletterContent.fromJSON(result.data)
      } else {
        console.warn('개인화된 백엔드 응답 실패, fallback 데이터 사용:', result.error)
        return this.createFallbackContent(newsletterId, { category, personalized: true, userId, limit })
      }
    } catch (error) {
      console.warn('개인화된 뉴스레터 콘텐츠 생성 실패, fallback 데이터 사용:', error.message)
      return this.createFallbackContent(newsletterId, { category, personalized: true, userId, limit })
    }
  }

  // Fallback 콘텐츠 생성 (백엔드 API가 없을 때 사용)
  createFallbackContent(newsletterId, options = {}) {
    const {
      category = '정치',
      personalized = false,
      userId,
      limit = 5
    } = options

    // 카테고리별 샘플 뉴스 데이터
    const sampleNews = {
      '정치': [
        {
          title: '국정감사에서 논란이 된 주요 쟁점들',
          summary: '국정감사 기간 동안 정부 정책에 대한 다양한 의견이 제시되었습니다.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: '연합뉴스',
          imageUrl: 'https://via.placeholder.com/400x200/4f46e5/ffffff?text=정치뉴스'
        },
        {
          title: '새로운 정책 발표로 업계 반응 주목',
          summary: '정부가 발표한 새로운 정책에 대해 업계의 다양한 반응이 나오고 있습니다.',
          url: '#',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: '뉴스1',
          imageUrl: 'https://via.placeholder.com/400x200/059669/ffffff?text=정책뉴스'
        },
        {
          title: '국회 예산안 심의 과정에서의 주요 쟁점',
          summary: '내년도 예산안 심의 과정에서 복지와 국방 예산 배분이 주요 쟁점으로 떠올랐습니다.',
          url: '#',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: '매일경제',
          imageUrl: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=예산뉴스'
        }
      ],
      '경제': [
        {
          title: '주식시장 급등세, 투자자들 관심 집중',
          summary: '최근 주식시장의 상승세가 지속되면서 개인투자자들의 관심이 높아지고 있습니다.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: '한국경제',
          imageUrl: 'https://via.placeholder.com/400x200/7c3aed/ffffff?text=주식뉴스'
        },
        {
          title: '부동산 시장 변화, 정책 효과 주목',
          summary: '최근 부동산 정책 변화로 인한 시장 반응이 주목받고 있습니다.',
          url: '#',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: '부동산뉴스',
          imageUrl: 'https://via.placeholder.com/400x200/ea580c/ffffff?text=부동산뉴스'
        }
      ],
      'IT/과학': [
        {
          title: 'AI 기술 발전으로 업계 변화 가속화',
          summary: '인공지능 기술의 급속한 발전이 다양한 산업 분야에 변화를 가져오고 있습니다.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: '테크크런치',
          imageUrl: 'https://via.placeholder.com/400x200/0891b2/ffffff?text=AI뉴스'
        },
        {
          title: '스마트폰 시장 경쟁 심화',
          summary: '최신 스마트폰 출시로 인한 시장 경쟁이 더욱 치열해지고 있습니다.',
          url: '#',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'IT뉴스',
          imageUrl: 'https://via.placeholder.com/400x200/be123c/ffffff?text=스마트폰뉴스'
        }
      ]
    }

    const newsItems = sampleNews[category] || sampleNews['정치']
    const selectedNews = newsItems.slice(0, limit)

    const content = {
      id: newsletterId,
      title: personalized ? `${category} 맞춤 뉴스레터` : `${category} 뉴스레터`,
      description: personalized ? `${userId}님을 위한 개인화된 ${category} 뉴스입니다.` : `${category} 분야의 최신 뉴스를 모아드립니다.`,
      category: category,
      personalized: personalized,
      sections: [
        {
          heading: personalized ? `${userId}님을 위한 ${category} 뉴스` : `오늘의 ${category} 뉴스`,
          subtitle: personalized ? '관심사 기반 맞춤 뉴스' : '최신 뉴스 모음',
          type: 'article',
          items: selectedNews
        }
      ],
      tags: [category, personalized ? '맞춤' : '일반', '뉴스레터'],
      footer: {
        unsubscribe: '구독 해지',
        preferences: '설정 변경',
        contact: '문의하기'
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        source: 'fallback'
      }
    }

    return NewsletterContent.fromJSON(content)
  }
}

// 싱글톤 인스턴스 생성
const newsletterContentService = new NewsletterContentService()

export default newsletterContentService
