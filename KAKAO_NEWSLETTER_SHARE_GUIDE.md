# 뉴스레터 카카오톡 공유 기능 개선 가이드

## 🎯 개선된 기능

### 1. 뉴스레터 특화 피드 B형 템플릿
- **기존**: 단순한 피드 템플릿
- **개선**: 뉴스레터에 최적화된 피드 B형 템플릿
- **특징**: 
  - 브랜드 프로필 표시
  - 최대 5개 기사 목록
  - 구독자 수 및 통계 정보
  - 뉴스레터 전용 버튼

### 2. 유연한 데이터 구조 지원
- **sections.items** 구조
- **articles** 배열
- **newsItems** 배열
- **content** 배열
- **단일 기사** 구조

### 3. 다양한 필드명 지원
- **브랜드**: `brandName`, `brand`, `publisher`, `author`
- **이미지**: `imageUrl`, `thumbnail`, `coverImage`
- **구독자**: `subscriberCount`, `subscribers`, `followers`, `readers`
- **카테고리**: `category`, `topic`, `section`

## 📋 카카오 개발자 콘솔 설정

### 1. 뉴스레터용 피드 B형 템플릿 생성

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. **도구 > 메시지 템플릿** 이동
3. **템플릿 만들기** 클릭
4. **피드 B형** 선택

### 2. 템플릿 구성 요소

```
🅐 이미지: ${imageUrl}
🅑 텍스트: ${title}
🅒 텍스트: ${description}
🅔 프로필: ${brandName}
🅕 프로필 이미지: ${brandImage}
🅖 텍스트 아이템: 
   - ${article1Title} | ${article1Summary}
   - ${article2Title} | ${article2Summary}
   - ${article3Title} | ${article3Summary}
   - ${article4Title} | ${article4Summary}
   - ${article5Title} | ${article5Summary}
🅗 요약 정보: ${totalArticles} | ${subscriberCount}
🅓 버튼: "뉴스레터 보기" → ${webUrl}
🅓 버튼: "구독하기" → ${mobileUrl}
```

### 3. 템플릿 변수 설정

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `${title}` | 뉴스레터 제목 | "오늘의 테크 뉴스" |
| `${description}` | 뉴스레터 설명 | "최신 IT 동향을 한눈에!" |
| `${imageUrl}` | 썸네일 이미지 | "https://example.com/thumb.jpg" |
| `${brandName}` | 브랜드명 | "NewSphere" |
| `${brandImage}` | 브랜드 로고 | "https://example.com/logo.png" |
| `${subscriberCount}` | 구독자 수 | "1,234명" |
| `${totalArticles}` | 총 기사 수 | "5개 기사" |
| `${article1Title}` | 첫 번째 기사 제목 | "AI 기술 혁신" |
| `${article1Summary}` | 첫 번째 기사 요약 | "챗GPT-5 출시 임박" |
| `${webUrl}` | 웹 링크 | "https://example.com/newsletter/1" |
| `${mobileUrl}` | 모바일 링크 | "https://example.com/newsletter/1" |

## 🔧 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
# 카카오 JavaScript 키
NEXT_PUBLIC_KAKAO_JS_KEY=your_javascript_key_here

# 뉴스레터용 템플릿 ID (새로 생성한 피드 B형 템플릿)
NEXT_PUBLIC_KAKAO_TEMPLATE_ID=your_new_template_id

# 카카오 리다이렉트 URI (친구에게 보내기용)
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/oauth/kakao
```

## 💻 사용법

### 1. 기본 사용법

```jsx
import KakaoShare from '@/components/KakaoShare'
import NewsphereKakaoShare from '@/components/NewsphereKakaoShare'

function NewsletterPage() {
  const newsletterData = {
    id: 'newsletter-1',
    title: '오늘의 테크 뉴스',
    description: '최신 IT 동향을 한눈에!',
    imageUrl: 'https://example.com/thumbnail.jpg',
    brandName: 'NewSphere',
    brandImage: 'https://example.com/logo.png',
    subscriberCount: 1234,
    category: 'IT/과학',
    sections: [{
      items: [
        { 
          title: 'AI 기술 혁신', 
          summary: '챗GPT-5 출시 임박' 
        },
        { 
          title: '반도체 업계 회복', 
          summary: '삼성전자 실적 전망 긍정적' 
        },
        { 
          title: '메타버스 시장 확대', 
          summary: 'VR/AR 기술 발전 가속화' 
        }
      ]
    }]
  }

  return (
    <div>
      {/* 일반 뉴스레터 공유 */}
      <KakaoShare 
        newsletterData={newsletterData}
        showStats={true}
      />
      
      {/* Newsphere 전용 뉴스 공유 */}
      <NewsphereKakaoShare 
        newsData={newsletterData}
      />
    </div>
  )
}
```

### 2. 다양한 데이터 구조 지원

```jsx
// articles 배열 구조
const newsletterData1 = {
  title: '주간 뉴스',
  articles: [
    { title: '기사 1', summary: '요약 1' },
    { title: '기사 2', summary: '요약 2' }
  ]
}

// newsItems 배열 구조
const newsletterData2 = {
  title: '일일 뉴스',
  newsItems: [
    { title: '뉴스 1', description: '설명 1' },
    { title: '뉴스 2', description: '설명 2' }
  ]
}

// content 배열 구조
const newsletterData3 = {
  title: '콘텐츠 모음',
  content: [
    { title: '콘텐츠 1', excerpt: '발췌 1' },
    { title: '콘텐츠 2', excerpt: '발췌 2' }
  ]
}
```

### 3. Newsphere 뉴스 공유

```jsx
import NewsphereKakaoShare from '@/components/NewsphereKakaoShare'

function NewsphereNewsPage() {
  const newsData = {
    id: 'news-1',
    title: '오늘의 주요 뉴스',
    description: '맞춤형 뉴스를 확인해보세요!',
    imageUrl: 'https://example.com/news-thumbnail.jpg',
    url: 'https://your-newsphere.com/news/1'
  }

  return (
    <NewsphereKakaoShare newsData={newsData} />
  )
}
```

### 4. 친구에게 보내기 기능

```jsx
import KakaoFriendMessage from '@/components/KakaoFriendMessage'

function NewsletterPreview() {
  return (
    <div>
      {/* 기존 공유 버튼 */}
      <KakaoShare newsletterData={newsletterData} />
      
      {/* Newsphere 뉴스 공유 */}
      <NewsphereKakaoShare newsData={newsletterData} />
      
      {/* 친구에게 보내기 */}
      <KakaoFriendMessage newsletterData={newsletterData} />
    </div>
  )
}
```

## 🎨 UI 컴포넌트 옵션

### KakaoShare 컴포넌트 Props

```jsx
<KakaoShare 
  newsletterData={newsletterData}    // 필수: 뉴스레터 데이터
  showStats={true}                   // 선택: 통계 정보 표시
  showFloating={false}               // 선택: 플로팅 버튼 표시
  className="custom-class"           // 선택: 커스텀 CSS 클래스
/>
```

### NewsphereKakaoShare 컴포넌트 Props

```jsx
<NewsphereKakaoShare 
  newsData={newsData}                // 필수: 뉴스 데이터
  className="custom-class"           // 선택: 커스텀 CSS 클래스
/>
```

### 통계 정보 표시

```jsx
// showStats={true}일 때 표시되는 정보
<div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
  <div className="flex items-center">
    <Users className="h-3 w-3 mr-1" />
    <span>1,234명</span>  {/* 구독자 수 */}
  </div>
  <div className="flex items-center">
    <TrendingUp className="h-3 w-3 mr-1" />
    <span>5개 기사</span>  {/* 기사 수 */}
  </div>
</div>
```

## 🚀 개발 환경에서 테스트

### 1. 개발 모드에서만 표시되는 테스트 버튼

```jsx
// process.env.NODE_ENV === 'development'일 때만 표시
<Button onClick={handleNewsletterShare}>
  뉴스레터 피드 B형 테스트
</Button>
```

### 2. 콘솔 로그 확인

```javascript
// 개발자 도구 콘솔에서 확인 가능한 로그
console.log('뉴스레터 공유 데이터:', data)
console.log('현재 도메인:', window.location.origin)
console.log('템플릿 인자:', templateArgs)
```

## 🔍 문제 해결

### 1. 템플릿 변수명 불일치

**문제**: 템플릿에서 `${REGI_WEB_DOMAIN}` 사용 중인데 코드에서는 `${webUrl}` 사용

**해결**: 
1. 카카오 개발자 콘솔에서 실제 템플릿 변수명 확인
2. `buildNewsletterTemplateArgs` 함수에서 변수명 수정

```javascript
const templateArgs = {
  '${REGI_WEB_DOMAIN}': currentUrl,  // 실제 템플릿 변수명 사용
  // ... 기타 변수들
}
```

### 2. 기사 데이터가 표시되지 않음

**문제**: 뉴스레터 데이터 구조가 예상과 다름

**해결**: 
1. `extractArticles` 함수에 새로운 데이터 구조 추가
2. 콘솔에서 실제 데이터 구조 확인

```javascript
// 새로운 데이터 구조 추가
if (data.customArticles && Array.isArray(data.customArticles)) {
  data.customArticles.forEach(article => {
    if (article.title) {
      articles.push({
        title: article.title,
        summary: article.summary || article.description || ''
      });
    }
  });
}
```

### 3. 이미지가 표시되지 않음

**문제**: 이미지 URL이 유효하지 않거나 접근 불가

**해결**:
1. 이미지 URL 유효성 확인
2. CORS 설정 확인
3. 기본 이미지로 fallback

```javascript
const imageUrl = data.imageUrl || 
  data.thumbnail || 
  data.coverImage || 
  'https://via.placeholder.com/800x400/667eea/ffffff?text=Newsletter'
```

## 📱 모바일 최적화

### 1. 반응형 디자인

```css
/* 모바일에서 버튼 크기 조정 */
@media (max-width: 768px) {
  .kakao-share-button {
    padding: 12px 16px;
    font-size: 14px;
  }
}
```

### 2. 터치 친화적 UI

```jsx
<Button
  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg touch-manipulation"
>
  카카오톡으로 공유하기
</Button>
```

## 🎉 완성!

이제 뉴스레터에 특화된 카카오톡 공유 기능이 완성되었습니다!

### 주요 개선사항:
- ✅ 뉴스레터 특화 피드 B형 템플릿
- ✅ 유연한 데이터 구조 지원
- ✅ 다양한 필드명 지원
- ✅ 친구에게 보내기 기능
- ✅ 개발 환경 테스트 기능
- ✅ 모바일 최적화

### 다음 단계:
1. 카카오 개발자 콘솔에서 피드 B형 템플릿 생성
2. 환경변수 설정
3. 실제 뉴스레터 데이터로 테스트
4. 사용자 피드백 수집 및 개선
