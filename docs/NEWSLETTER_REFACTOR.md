# 뉴스레터 시스템 리팩토링

## 개요

사용자의 권장사항에 따라 뉴스레터 시스템을 **"콘텐츠 조립(도메인)"과 "렌더링(표현)"을 분리**하는 구조로 리팩토링했습니다.

## 🎯 리팩토링 목표

### 기존 문제점
- 서비스 레이어에서 HTML을 직접 String으로 조립하는 방식
- 역할이 섞여 있어 유지보수가 어려움
- 이메일과 웹 렌더링이 분리되지 않음

### 개선 방향
- **도메인 로직**: JSON/DTO만 반환하는 콘텐츠 생성 서비스
- **표현 로직**: 이메일 HTML 렌더러와 웹 컴포넌트 분리
- **재사용성**: 하나의 JSON을 이메일/웹 각각의 렌더러로 재사용

## 📁 새로운 구조

```
lib/
├── types/
│   └── newsletter.js              # 뉴스레터 DTO 타입 정의
├── services/
│   └── NewsletterContentService.js # 콘텐츠 생성 서비스 (도메인 로직)
├── renderers/
│   └── EmailRenderer.js           # 이메일 HTML 렌더러
└── newsletterService.js           # 업데이트된 서비스 래퍼

app/(api)/api/newsletters/
├── content/route.js               # JSON 콘텐츠 API
└── email/route.js                 # 이메일 HTML API

app/(newsletter)/newsletter/
└── preview/page.jsx               # 테스트 페이지
```

## 🔧 주요 컴포넌트

### 1. NewsletterContent DTO (`lib/types/newsletter.js`)

```javascript
// 뉴스레터 콘텐츠 메인 DTO
export class NewsletterContent {
  constructor(data = {}) {
    this.id = data.id || null
    this.title = data.title || ""
    this.description = data.description || ""
    this.category = data.category || ""
    this.personalized = data.personalized || false
    this.sections = data.sections || []
    this.tags = data.tags || []
    this.footer = data.footer || { ... }
    this.metadata = data.metadata || { ... }
  }

  // 섹션 추가 메서드들
  addSection(section) { ... }
  addArticleSection(heading, articles) { ... }
  addHeaderSection(heading, subtitle) { ... }

  // JSON 직렬화/역직렬화
  toJSON() { ... }
  static fromJSON(json) { ... }
}
```

### 2. NewsletterContentService (`lib/services/NewsletterContentService.js`)

```javascript
export class NewsletterContentService {
  // 기본 뉴스레터 콘텐츠 생성 (JSON만 반환)
  async buildContent(newsletterId, options = {}) {
    // 뉴스 데이터 수집
    const newsItems = await this.collectNewsItems(options)
    
    // 뉴스레터 콘텐츠 생성
    const content = new NewsletterContent({ ... })
    
    // 섹션 구성
    await this.buildSections(content, newsItems, category)
    
    return content // JSON/DTO 반환
  }

  // 개인화된 뉴스레터 콘텐츠 생성
  async buildPersonalizedContent(newsletterId, userId, options = {}) {
    // 사용자 선호도 기반 뉴스 수집
    const personalizedNews = await this.getPersonalizedNews(userId, limit)
    
    // 트렌딩/최신 뉴스 추가
    const additionalNews = await this.getAdditionalNews(options)
    
    // 중복 제거 및 병합
    const allNews = this.mergeAndDeduplicateNews([...personalizedNews, ...additionalNews])
    
    // 뉴스레터 콘텐츠 생성
    const content = new NewsletterContent({ ... })
    
    // 섹션 구성
    await this.buildPersonalizedSections(content, allNews, userId)
    
    return content
  }
}
```

### 3. EmailRenderer (`lib/renderers/EmailRenderer.js`)

```javascript
export class EmailRenderer {
  // 뉴스레터 콘텐츠를 이메일 HTML로 렌더링
  renderNewsletter(content, options = {}) {
    // NewsletterContent 인스턴스 검증
    if (!(content instanceof NewsletterContent)) {
      throw new Error('NewsletterContent 인스턴스가 필요합니다.')
    }

    // 이메일-safe HTML 생성
    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <title>${content.title}</title>
          <style>${this.getEmailStyles(theme)}</style>
      </head>
      <body>
          ${this.renderHeader(content)}
          ${this.renderContent(content)}
          ${this.renderFooter(content, options)}
      </body>
      </html>`

    return html
  }

  // 텍스트 버전 생성
  renderTextVersion(content) { ... }
}
```

## 🌐 API 엔드포인트

### 1. 콘텐츠 API (`/api/newsletters/content`)

```javascript
// GET /api/newsletters/content?category=정치&personalized=true&userId=123
// POST /api/newsletters/content
{
  "newsletterId": 1234567890,
  "category": "정치",
  "personalized": true,
  "userId": "user-123",
  "limit": 5
}

// 응답: JSON 형태의 뉴스레터 콘텐츠
{
  "success": true,
  "data": {
    "id": 1234567890,
    "title": "정치 뉴스레터 - 1월 15일",
    "description": "국회 소식, 정책 동향, 정치 현안을 한눈에!",
    "category": "정치",
    "personalized": true,
    "sections": [
      {
        "heading": "🏛️ 정치 뉴스",
        "type": "article",
        "items": [...]
      }
    ],
    "tags": ["정치", "국회", "정책", "현안"],
    "footer": { ... },
    "metadata": { ... }
  }
}
```

### 2. 이메일 API (`/api/newsletters/email`)

```javascript
// GET /api/newsletters/email?category=정치&personalized=true&userId=123
// POST /api/newsletters/email
{
  "newsletterId": 1234567890,
  "category": "정치",
  "personalized": true,
  "userId": "user-123",
  "limit": 5,
  "includeTracking": true,
  "includeUnsubscribe": true,
  "theme": "default",
  "format": "html" // 또는 "text"
}

// 응답: HTML 또는 텍스트
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>정치 뉴스레터 - 1월 15일</title>
    <style>...</style>
</head>
<body>
    <!-- 이메일-safe HTML -->
</body>
</html>
```

## 🎨 사용법

### 1. 웹에서 뉴스레터 렌더링

```javascript
import { newsletterService } from '@/lib/newsletterService'
import NewsletterTemplate from '@/components/NewsletterTemplate'

// 뉴스레터 콘텐츠 생성
const content = await newsletterService.generateLocalNewsletterContent({
  newsletterId: Date.now(),
  category: "정치",
  personalized: false,
  limit: 5
})

// React 컴포넌트로 렌더링
<NewsletterTemplate newsletter={content} isPreview={true} />
```

### 2. 이메일 HTML 생성

```javascript
import { newsletterService } from '@/lib/newsletterService'

// 이메일 HTML 생성
const emailHtml = await newsletterService.generateNewsletterEmail({
  newsletterId: content.id,
  category: "정치",
  personalized: true,
  userId: "user-123",
  includeTracking: true,
  includeUnsubscribe: true,
  theme: "default",
  format: "html"
})

// 이메일 발송 서비스로 전달
await emailService.send({
  to: "user@example.com",
  subject: "정치 뉴스레터 - 1월 15일",
  html: emailHtml
})
```

### 3. 개인화된 뉴스레터

```javascript
// 개인화된 뉴스레터 콘텐츠 생성
const personalizedContent = await newsletterService.generatePersonalizedNewsletter(
  "user-123",
  {
    category: "IT/과학",
    limit: 8,
    includeTrending: true,
    includeLatest: true
  }
)

// 이메일 HTML 생성
const emailHtml = await newsletterService.generateNewsletterEmail({
  newsletterId: personalizedContent.id,
  personalized: true,
  userId: "user-123",
  includeTracking: true,
  includeUnsubscribe: true
})
```

## 🧪 테스트

### 미리보기 페이지 (`/newsletter/preview`)

- 다양한 카테고리와 설정으로 뉴스레터 생성 테스트
- 이메일 HTML/텍스트 생성 및 미리보기
- JSON 데이터 구조 확인
- 복사 기능으로 생성된 콘텐츠 활용

### API 테스트

```bash
# 콘텐츠 생성
curl -X POST http://localhost:3000/api/newsletters/content \
  -H "Content-Type: application/json" \
  -d '{"category":"정치","personalized":false,"limit":5}'

# 이메일 HTML 생성
curl -X POST http://localhost:3000/api/newsletters/email \
  -H "Content-Type: application/json" \
  -d '{"category":"정치","personalized":false,"limit":5,"format":"html"}'

# 이메일 텍스트 생성
curl -X POST http://localhost:3000/api/newsletters/email \
  -H "Content-Type: application/json" \
  -d '{"category":"정치","personalized":false,"limit":5,"format":"text"}'
```

## 🔄 마이그레이션 가이드

### 기존 코드에서 새로운 구조로

```javascript
// 기존 방식 (제거 권장)
const html = `
  <h1>${title}</h1>
  <p>${description}</p>
  ${articles.map(article => `
    <div>
      <h2>${article.title}</h2>
      <p>${article.summary}</p>
    </div>
  `).join('')}
`

// 새로운 방식 (권장)
// 1. 콘텐츠 생성
const content = await newsletterContentService.buildContent(newsletterId, options)

// 2. 렌더링 (웹)
<NewsletterTemplate newsletter={content} />

// 3. 렌더링 (이메일)
const emailHtml = emailRenderer.renderNewsletter(content, emailOptions)
```

## 🎯 장점

### 1. **관심사 분리**
- 도메인 로직과 표현 로직이 명확히 분리됨
- 각 컴포넌트의 책임이 명확함

### 2. **재사용성**
- 하나의 JSON을 이메일/웹 각각의 렌더러로 재사용
- 새로운 렌더러 추가가 용이함

### 3. **테스트 용이성**
- 도메인 로직과 렌더링 로직을 독립적으로 테스트 가능
- JSON 구조만 검증하면 됨

### 4. **유지보수성**
- HTML 템플릿 변경이 렌더러에만 영향
- 비즈니스 로직 변경이 콘텐츠 생성에만 영향

### 5. **확장성**
- 새로운 뉴스레터 타입 추가가 용이
- 다양한 이메일 클라이언트 지원 가능

## 🚀 다음 단계

### 1. **실제 이메일 발송 통합**
```javascript
// SES, SendGrid 등과 통합
import { emailService } from '@/lib/emailService'

const emailHtml = await newsletterService.generateNewsletterEmail(options)
await emailService.send({
  to: subscriber.email,
  subject: content.title,
  html: emailHtml,
  text: await newsletterService.generateNewsletterEmail({ ...options, format: 'text' })
})
```

### 2. **템플릿 엔진 도입**
```javascript
// Handlebars, MJML 등 템플릿 엔진 도입
import { handlebars } from 'handlebars'
import mjml from 'mjml'

// MJML 템플릿으로 이메일 품질 향상
const mjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>{{title}}</mj-text>
        {{#each sections}}
          <mj-text>{{heading}}</mj-text>
          {{#each items}}
            <mj-text>{{title}}</mj-text>
          {{/each}}
        {{/each}}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`
```

### 3. **캐싱 및 성능 최적화**
```javascript
// Redis 캐싱으로 성능 향상
import { redis } from '@/lib/redis'

const cacheKey = `newsletter:${newsletterId}:${userId}`
const cached = await redis.get(cacheKey)
if (cached) {
  return NewsletterContent.fromJSON(JSON.parse(cached))
}

const content = await newsletterContentService.buildContent(newsletterId, options)
await redis.setex(cacheKey, 3600, JSON.stringify(content.toJSON()))
```

### 4. **A/B 테스트 지원**
```javascript
// 다양한 템플릿과 콘텐츠 조합 테스트
const variants = {
  template: ['default', 'modern', 'minimal'],
  layout: ['single-column', 'two-column', 'grid'],
  content: ['trending', 'latest', 'personalized']
}

const variant = await abTestService.getVariant(userId, 'newsletter')
const content = await newsletterContentService.buildContent(newsletterId, {
  ...options,
  variant
})
```

## 📝 결론

이번 리팩토링을 통해 **"콘텐츠 조립(도메인)"과 "렌더링(표현)"을 분리**하는 깔끔한 구조를 만들었습니다. 

- **이메일 발송용**: 서버에서 개인화 로직과 이메일-safe HTML 렌더링
- **웹 렌더링용**: 프론트엔드에서 React 컴포넌트로 렌더링
- **재사용성**: 하나의 JSON을 다양한 렌더러로 활용

이제 뉴스레터 시스템이 더욱 유지보수하기 쉽고, 확장 가능하며, 테스트하기 쉬운 구조가 되었습니다! 🎉
