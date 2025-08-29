# 카카오톡 공유 기능 가이드

이 문서는 뉴스레터 앱에서 카카오톡 공유 기능을 구현하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [설정](#설정)
3. [사용법](#사용법)
4. [템플릿 빌더](#템플릿-빌더)
5. [API 참조](#api-참조)
6. [예제](#예제)

## 개요

카카오톡 공유 기능은 두 가지 방식으로 구현할 수 있습니다:

1. **기본 템플릿 방식**: 카카오에서 제공하는 기본 피드 템플릿 사용
2. **사용자 정의 템플릿 방식**: 카카오 템플릿 빌더를 사용한 커스텀 템플릿 사용

## 설정

### 1. 카카오 개발자 계정 설정

1. [Kakao Developers](https://developers.kakao.com/)에 로그인
2. 새 애플리케이션 생성
3. JavaScript 키 복사
4. 플랫폼 설정에서 도메인 등록

### 2. 환경 변수 설정

`.env.local` 파일에 카카오 JavaScript 키를 추가:

```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_key_here
```

### 3. 카카오 SDK 로드

`_app.js` 또는 `layout.js`에서 카카오 SDK를 로드:

```jsx
// app/layout.js 또는 pages/_app.js
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 사용법

### 1. 기본 템플릿 사용

```jsx
import { useSimpleKakaoShare } from '../hooks/useKakaoShare'

function MyComponent() {
  const { share, isLoading, error } = useSimpleKakaoShare()

  const handleShare = async () => {
    try {
      await share({
        title: '📰 오늘의 뉴스',
        description: '흥미로운 뉴스를 확인해보세요!',
        imageUrl: 'https://example.com/image.jpg',
        url: 'https://example.com/newsletter'
      })
    } catch (error) {
      console.error('공유 실패:', error)
    }
  }

  return (
    <button onClick={handleShare} disabled={isLoading}>
      {isLoading ? '공유 중...' : '카카오톡 공유'}
    </button>
  )
}
```

### 2. 사용자 정의 템플릿 사용

```jsx
import { useKakaoShare } from '../hooks/useKakaoShare'

function NewsletterComponent({ newsletter }) {
  const { share, isLoading, error } = useKakaoShare(123798) // 템플릿 ID

  const handleShare = async () => {
    try {
      await share(newsletter)
    } catch (error) {
      console.error('공유 실패:', error)
    }
  }

  return (
    <button onClick={handleShare} disabled={isLoading}>
      {isLoading ? '공유 중...' : '카카오톡 공유'}
    </button>
  )
}
```

### 3. 유틸리티 함수 직접 사용

```jsx
import { shareWithCustomTemplate, NewsletterKakaoShare } from '../utils/kakaoShare'

// 함수형 사용
const handleShare = async () => {
  try {
    await shareWithCustomTemplate({
      'TITLE': '뉴스레터 제목',
      'DESCRIPTION': '뉴스레터 설명',
      'IMAGE_URL': 'https://example.com/image.jpg',
      'WEB_URL': 'https://example.com/newsletter'
    })
  } catch (error) {
    console.error('공유 실패:', error)
  }
}

// 클래스형 사용
const kakaoShare = new NewsletterKakaoShare(123798, 'your_app_key')
await kakaoShare.shareNewsletter(newsletterData)
```

## 템플릿 빌더

### 1. 템플릿 생성

1. [Kakao Developers](https://developers.kakao.com/) → 내 애플리케이션
2. 메시지 → 템플릿 → 템플릿 만들기
3. 템플릿 빌더에서 원하는 디자인 구성
4. 변수 설정 (예: `TITLE`, `DESCRIPTION`, `IMAGE_URL`)

### 2. 템플릿 변수

다음 변수들을 템플릿에서 사용할 수 있습니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `TITLE` | 뉴스레터 제목 | "📰 오늘의 테크 뉴스" |
| `DESCRIPTION` | 뉴스레터 설명 | "최신 기술 트렌드를 확인하세요!" |
| `IMAGE_URL` | 썸네일 이미지 URL | "https://example.com/image.jpg" |
| `WEB_URL` | 웹 URL | "https://example.com/newsletter" |
| `MOBILE_URL` | 모바일 URL | "https://example.com/newsletter" |
| `PUBLISHED_DATE` | 발행일 | "2024. 1. 15." |
| `CATEGORY` | 카테고리 | "Technology" |
| `AUTHOR` | 작성자 | "Newsphere" |
| `SUMMARY_1` | 첫 번째 기사 제목 | "AI 기술의 새로운 돌파구" |
| `SUMMARY_2` | 두 번째 기사 제목 | "클라우드 컴퓨팅의 미래" |
| `SUMMARY_3` | 세 번째 기사 제목 | "스타트업 투자 동향" |
| `ARTICLE_COUNT` | 기사 개수 | "5" |

## API 참조

### useKakaoShare(templateId, appKey)

카카오 공유를 위한 React Hook

**매개변수:**
- `templateId` (number): 템플릿 ID (기본값: 123798)
- `appKey` (string): 카카오 JavaScript 키 (기본값: 환경변수에서 가져옴)

**반환값:**
- `share(newsletterData)`: 공유 함수
- `isLoading`: 로딩 상태
- `error`: 에러 메시지
- `kakaoShare`: KakaoShare 인스턴스

### useSimpleKakaoShare()

기본 템플릿을 사용하는 간단한 카카오 공유 Hook

**반환값:**
- `share(data)`: 공유 함수
- `isLoading`: 로딩 상태
- `error`: 에러 메시지

### NewsletterKakaoShare

카카오 공유를 위한 클래스

**생성자:**
```js
new NewsletterKakaoShare(templateId, appKey)
```

**메서드:**
- `shareNewsletter(newsletterData)`: 뉴스레터 공유
- `buildTemplateArgs(data)`: 템플릿 인자 구성
- `trackShare(status, newsletterId, error)`: 공유 추적

## 예제

### 뉴스레터 컴포넌트에서 사용

```jsx
// components/NewsletterTemplate.jsx
import { useKakaoShare } from '../hooks/useKakaoShare'

export default function NewsletterTemplate({ newsletter }) {
  const { share, isLoading } = useKakaoShare(123798)

  const handleKakaoShare = async () => {
    try {
      await share(newsletter)
      console.log('카카오톡 공유 성공!')
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
    }
  }

  return (
    <div>
      {/* 뉴스레터 내용 */}
      <button 
        onClick={handleKakaoShare} 
        disabled={isLoading}
        className="share-button"
      >
        {isLoading ? '공유 중...' : '카카오톡 공유'}
      </button>
    </div>
  )
}
```

### 여러 템플릿 사용

```jsx
import { NewsletterTemplates, shareNewsletterWithTemplate } from '../utils/kakaoShare'

const handleShare = async (templateType) => {
  try {
    await shareNewsletterWithTemplate(templateType, newsletterData)
  } catch (error) {
    console.error('공유 실패:', error)
  }
}

// 사용 예시
<button onClick={() => handleShare(NewsletterTemplates.GENERAL)}>
  일반 템플릿으로 공유
</button>
<button onClick={() => handleShare(NewsletterTemplates.SPECIAL)}>
  특별 이슈 템플릿으로 공유
</button>
```

### A/B 테스트

```jsx
import { shareWithABTest } from '../utils/kakaoShare'

const handleABTestShare = async () => {
  try {
    await shareWithABTest(newsletterData)
  } catch (error) {
    console.error('A/B 테스트 공유 실패:', error)
  }
}
```

## 주의사항

1. **도메인 등록**: 카카오 개발자 콘솔에서 사용할 도메인을 등록해야 합니다.
2. **HTTPS 필수**: 프로덕션 환경에서는 HTTPS가 필요합니다.
3. **템플릿 승인**: 사용자 정의 템플릿은 카카오 승인이 필요할 수 있습니다.
4. **에러 처리**: 네트워크 오류나 SDK 로드 실패에 대한 처리가 필요합니다.

## 문제 해결

### SDK 로드 실패
- 카카오 개발자 콘솔에서 JavaScript 키 확인
- 도메인 등록 확인
- 네트워크 연결 확인

### 템플릿 오류
- 템플릿 ID 확인
- 템플릿 변수명 확인
- 템플릿 승인 상태 확인

### 공유 실패
- 브라우저 콘솔에서 에러 메시지 확인
- 카카오톡 앱 설치 여부 확인
- 모바일 환경에서 테스트
