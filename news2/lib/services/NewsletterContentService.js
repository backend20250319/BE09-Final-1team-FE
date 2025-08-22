// 뉴스레터 콘텐츠 서비스
class NewsletterContentService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  }

  // 뉴스레터 콘텐츠 생성
  async generateContent(topic, style = 'informative') {
    try {
      const response = await fetch(`${this.baseUrl}/api/newsletters/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          style,
          length: 'medium'
        })
      })

      if (!response.ok) {
        throw new Error('뉴스레터 콘텐츠 생성에 실패했습니다.')
      }

      return await response.json()
    } catch (error) {
      console.error('뉴스레터 콘텐츠 생성 오류:', error)
      
      // 폴백 콘텐츠 반환
      return {
        title: `${topic} 관련 최신 소식`,
        content: `${topic}에 대한 최신 정보와 분석을 제공합니다.`,
        summary: `${topic} 분야의 주요 동향을 정리했습니다.`,
        tags: [topic, '뉴스', '분석'],
        isFallback: true
      }
    }
  }

  // 뉴스레터 템플릿 적용
  applyTemplate(content, template = 'default') {
    const templates = {
      default: {
        header: {
          backgroundColor: '#f8f9fa',
          textColor: '#333333'
        },
        body: {
          backgroundColor: '#ffffff',
          textColor: '#333333'
        },
        footer: {
          backgroundColor: '#f8f9fa',
          textColor: '#666666'
        }
      },
      modern: {
        header: {
          backgroundColor: '#667eea',
          textColor: '#ffffff'
        },
        body: {
          backgroundColor: '#ffffff',
          textColor: '#333333'
        },
        footer: {
          backgroundColor: '#f7fafc',
          textColor: '#666666'
        }
      }
    }

    const selectedTemplate = templates[template] || templates.default

    return {
      ...content,
      template: selectedTemplate
    }
  }

  // 뉴스레터 미리보기 생성
  async generatePreview(newsletterData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/newsletters/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsletterData)
      })

      if (!response.ok) {
        throw new Error('뉴스레터 미리보기 생성에 실패했습니다.')
      }

      return await response.json()
    } catch (error) {
      console.error('뉴스레터 미리보기 생성 오류:', error)
      
      // 폴백 미리보기 반환
      return {
        html: `<div style="padding: 20px; background-color: #f8f9fa;">
          <h1 style="color: #333;">${newsletterData.title || '뉴스레터 제목'}</h1>
          <p style="color: #666;">${newsletterData.content || '뉴스레터 내용'}</p>
        </div>`,
        text: `${newsletterData.title || '뉴스레터 제목'}\n\n${newsletterData.content || '뉴스레터 내용'}`,
        isFallback: true
      }
    }
  }

  // 뉴스레터 발송
  async sendNewsletter(newsletterData, subscribers) {
    try {
      const response = await fetch(`${this.baseUrl}/api/newsletters/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsletter: newsletterData,
          subscribers
        })
      })

      if (!response.ok) {
        throw new Error('뉴스레터 발송에 실패했습니다.')
      }

      return await response.json()
    } catch (error) {
      console.error('뉴스레터 발송 오류:', error)
      throw error
    }
  }
}

export default NewsletterContentService
