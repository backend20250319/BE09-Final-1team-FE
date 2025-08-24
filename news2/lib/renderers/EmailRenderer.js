import { NewsletterContent } from '../types/newsletter'

/**
 * 이메일 렌더러
 * 뉴스레터 콘텐츠를 이메일-safe HTML로 변환
 */
export class EmailRenderer {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://newsphere.com'
  }

  /**
   * 뉴스레터 콘텐츠를 이메일 HTML로 렌더링
   */
  renderNewsletter(content, options = {}) {
    const {
      includeTracking = true,
      includeUnsubscribe = true,
      theme = 'default'
    } = options

    if (!(content instanceof NewsletterContent)) {
      throw new Error('NewsletterContent 인스턴스가 필요합니다.')
    }

    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        ${this.getEmailStyles(theme)}
    </style>
</head>
<body>
    ${this.renderHeader(content)}
    ${this.renderContent(content)}
    ${this.renderFooter(content, { includeUnsubscribe, includeTracking })}
</body>
</html>`

    return html
  }

  /**
   * 헤더 렌더링
   */
  renderHeader(content) {
    const date = new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })

    return `
    <div class="header">
        <div class="container">
            <div class="logo">
                <h1>📰 NewSphere</h1>
            </div>
            <div class="newsletter-info">
                <h2>${this.escapeHtml(content.title)}</h2>
                <p class="description">${this.escapeHtml(content.description)}</p>
                <div class="meta">
                    <span class="date">${date}</span>
                    ${content.personalized ? '<span class="badge personalized">맞춤</span>' : ''}
                    <span class="category">${this.escapeHtml(content.category)}</span>
                </div>
            </div>
        </div>
    </div>`
  }

  /**
   * 콘텐츠 렌더링
   */
  renderContent(content) {
    if (!content.sections || content.sections.length === 0) {
      return `
      <div class="content">
        <div class="container">
          <div class="empty-state">
            <p>새로운 뉴스가 준비 중입니다.</p>
          </div>
        </div>
      </div>`
    }

    const sectionsHtml = content.sections.map(section => {
      if (section.type === 'header') {
        return this.renderHeaderSection(section)
      } else if (section.type === 'article') {
        return this.renderArticleSection(section)
      }
      return ''
    }).join('')

    return `
    <div class="content">
        <div class="container">
            ${sectionsHtml}
        </div>
    </div>`
  }

  /**
   * 헤더 섹션 렌더링
   */
  renderHeaderSection(section) {
    return `
    <div class="section header-section">
        <h2>${this.escapeHtml(section.heading)}</h2>
        ${section.subtitle ? `<p class="subtitle">${this.escapeHtml(section.subtitle)}</p>` : ''}
    </div>`
  }

  /**
   * 기사 섹션 렌더링
   */
  renderArticleSection(section) {
    if (!section.items || section.items.length === 0) {
      return ''
    }

    const articlesHtml = section.items.map(article => this.renderArticle(article)).join('')

    return `
    <div class="section article-section">
        <h3>${this.escapeHtml(section.heading)}</h3>
        <div class="articles">
            ${articlesHtml}
        </div>
    </div>`
  }

  /**
   * 개별 기사 렌더링
   */
  renderArticle(article) {
    const publishedDate = article.publishedAt 
      ? new Date(article.publishedAt).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric"
        })
      : ''

    return `
    <div class="article">
        <div class="article-content">
            <div class="article-meta">
                <span class="category">${this.escapeHtml(article.category)}</span>
                ${publishedDate ? `<span class="date">${publishedDate}</span>` : ''}
                ${article.readTime ? `<span class="read-time">${article.readTime}</span>` : ''}
            </div>
            <h4 class="article-title">
                <a href="${this.escapeHtml(article.url)}" target="_blank">
                    ${this.escapeHtml(article.title)}
                </a>
            </h4>
            ${article.summary ? `<p class="article-summary">${this.escapeHtml(article.summary)}</p>` : ''}
            <div class="article-footer">
                ${article.source ? `<span class="source">${this.escapeHtml(article.source)}</span>` : ''}
                ${article.author ? `<span class="author">${this.escapeHtml(article.author)}</span>` : ''}
            </div>
        </div>
        ${article.image ? `
        <div class="article-image">
            <img src="${this.escapeHtml(article.image)}" alt="${this.escapeHtml(article.title)}" />
        </div>` : ''}
    </div>`
  }

  /**
   * 푸터 렌더링
   */
  renderFooter(content, options) {
    const { includeUnsubscribe, includeTracking } = options

    return `
    <div class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="tags">
                    ${content.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                </div>
                
                <div class="footer-links">
                    ${content.footer.preferences ? `<a href="${this.baseUrl}/mypage?tab=settings" class="footer-link">${content.footer.preferences}</a>` : ''}
                    ${content.footer.contact ? `<a href="${this.baseUrl}/contact" class="footer-link">${content.footer.contact}</a>` : ''}
                    ${includeUnsubscribe && content.footer.unsubscribe ? `<a href="${this.baseUrl}/newsletter/unsubscribe?token={{unsubscribe_token}}" class="footer-link unsubscribe">${content.footer.unsubscribe}</a>` : ''}
                </div>
                
                <div class="web-version">
                    <a href="${this.baseUrl}/newsletter/${content.id}" class="web-link">웹에서 보기</a>
                </div>
                
                <div class="copyright">
                    <p>&copy; 2024 NewSphere. 모든 권리 보유.</p>
                </div>
            </div>
            
            ${includeTracking ? this.renderTrackingPixel() : ''}
        </div>
    </div>`
  }

  /**
   * 트래킹 픽셀 렌더링
   */
  renderTrackingPixel() {
    return `
    <div class="tracking" style="display: none;">
        <img src="${this.baseUrl}/api/tracking/open?token={{tracking_token}}" width="1" height="1" alt="" />
    </div>`
  }

  /**
   * 이메일-safe CSS 스타일
   */
  getEmailStyles(theme) {
    const baseStyles = `
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo h1 {
            margin: 0 0 20px 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .newsletter-info h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 600;
        }
        
        .description {
            margin: 0 0 15px 0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .meta {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .date, .category {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .badge.personalized {
            background-color: #ff6b6b;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .content {
            padding: 30px 20px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h3 {
            margin: 0 0 20px 0;
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        
        .header-section {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header-section h2 {
            font-size: 24px;
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        
        .subtitle {
            font-size: 16px;
            color: #6c757d;
            margin: 0;
        }
        
        .articles {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .article {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            background-color: #ffffff;
            transition: box-shadow 0.2s ease;
        }
        
        .article:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .article-meta {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        
        .category, .date, .read-time {
            font-size: 12px;
            color: #6c757d;
            background-color: #f8f9fa;
            padding: 2px 8px;
            border-radius: 4px;
        }
        
        .article-title {
            margin: 0 0 10px 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .article-title a {
            color: #2c3e50;
            text-decoration: none;
        }
        
        .article-title a:hover {
            color: #667eea;
        }
        
        .article-summary {
            margin: 0 0 15px 0;
            color: #6c757d;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .article-footer {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: #6c757d;
        }
        
        .source, .author {
            font-style: italic;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px 20px;
            text-align: center;
        }
        
        .tags {
            margin-bottom: 20px;
        }
        
        .tag {
            display: inline-block;
            background-color: #e9ecef;
            color: #6c757d;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin: 2px;
        }
        
        .footer-links {
            margin-bottom: 20px;
        }
        
        .footer-link {
            color: #6c757d;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        
        .footer-link:hover {
            color: #667eea;
        }
        
        .footer-link.unsubscribe {
            color: #dc3545;
        }
        
        .web-version {
            margin-bottom: 20px;
        }
        
        .web-link {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
        }
        
        .web-link:hover {
            background-color: #5a6fd8;
        }
        
        .copyright {
            color: #6c757d;
            font-size: 12px;
            margin: 0;
        }
        
        /* 반응형 디자인 */
        @media (max-width: 600px) {
            .container {
                margin: 0;
            }
            
            .header {
                padding: 20px 15px;
            }
            
            .content {
                padding: 20px 15px;
            }
            
            .article {
                padding: 15px;
            }
            
            .meta {
                flex-direction: column;
                gap: 8px;
            }
        }
    `

    return baseStyles
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * 미리보기용 HTML 생성 (웹에서 보기)
   */
  renderPreview(content) {
    return this.renderNewsletter(content, {
      includeTracking: false,
      includeUnsubscribe: false
    })
  }

  /**
   * 텍스트 버전 생성 (이메일 클라이언트에서 HTML을 지원하지 않는 경우)
   */
  renderTextVersion(content) {
    let text = `${content.title}\n`
    text += `${'='.repeat(content.title.length)}\n\n`
    text += `${content.description}\n\n`

    if (content.sections) {
      content.sections.forEach(section => {
        text += `${section.heading}\n`
        text += `${'-'.repeat(section.heading.length)}\n\n`
        
        if (section.items) {
          section.items.forEach(article => {
            text += `${article.title}\n`
            if (article.summary) {
              text += `${article.summary}\n`
            }
            text += `링크: ${article.url}\n\n`
          })
        }
      })
    }

    text += `\n웹에서 보기: ${this.baseUrl}/newsletter/${content.id}\n`
    text += `구독 해지: ${this.baseUrl}/newsletter/unsubscribe\n`

    return text
  }
}

// 싱글톤 인스턴스
export const emailRenderer = new EmailRenderer()
