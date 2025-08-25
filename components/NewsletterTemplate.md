# 뉴스레터 템플릿 사용법

## 개요

`NewsletterTemplate` 컴포넌트는 이메일 형태의 뉴스레터를 표시하는 반응형 템플릿입니다. 다양한 뉴스레터 스타일을 지원하며, 미리보기 모드와 실제 발송 모드를 구분할 수 있습니다.

## 기본 사용법

```jsx
import NewsletterTemplate from "@/components/NewsletterTemplate"

// 기본 템플릿 사용
<NewsletterTemplate />

// 커스텀 데이터와 함께 사용
<NewsletterTemplate 
  newsletter={customNewsletterData}
  isPreview={true}
/>
```

## Props

### newsletter (object, optional)
뉴스레터 데이터 객체. 제공하지 않으면 기본 템플릿이 사용됩니다.

```jsx
const newsletterData = {
  id: 1,
  title: "뉴스레터 제목",
  description: "뉴스레터 설명",
  category: "카테고리",
  author: "작성자명",
  authorAvatar: "/path/to/avatar.jpg",
  date: "2024년 1월 15일",
  time: "오전 9:00",
  subscribers: 15420,
  views: 8920,
  content: [
    {
      type: "header",
      title: "섹션 제목",
      subtitle: "섹션 부제목"
    },
    {
      type: "article",
      title: "기사 제목",
      summary: "기사 요약",
      image: "/path/to/image.jpg",
      readTime: "3분",
      category: "기사 카테고리"
    }
  ],
  tags: ["태그1", "태그2"],
  footer: {
    unsubscribe: "구독 해지",
    preferences: "설정 변경",
    contact: "문의하기"
  }
}
```

### isPreview (boolean, optional)
미리보기 모드 여부. `true`일 경우 미리보기 표시가 나타납니다.

## 데이터 구조

### content 배열
뉴스레터 콘텐츠를 구성하는 배열입니다. 각 항목은 다음 타입을 지원합니다:

#### header 타입
```jsx
{
  type: "header",
  title: "섹션 제목",
  subtitle: "섹션 부제목"
}
```

#### article 타입
```jsx
{
  type: "article",
  title: "기사 제목",
  summary: "기사 요약 내용",
  image: "/path/to/image.jpg",
  readTime: "읽는 시간",
  category: "기사 카테고리"
}
```

## 스타일링

템플릿은 Tailwind CSS를 사용하여 스타일링되어 있습니다. 주요 스타일 클래스:

- **헤더**: `text-2xl font-bold text-gray-900`
- **카드**: `border rounded-lg p-4 hover:shadow-md transition-shadow`
- **버튼**: `text-blue-600` (링크 스타일)
- **배지**: `variant="secondary"` 또는 `variant="outline"`

## 반응형 디자인

템플릿은 모바일과 데스크톱에서 모두 최적화되어 있습니다:

- **데스크톱**: 최대 너비 4xl, 중앙 정렬
- **모바일**: 패딩 조정, 이미지 크기 최적화
- **태블릿**: 중간 크기 레이아웃

## 기능

### 상호작용
- 좋아요 버튼 (하트 아이콘)
- 북마크 버튼 (북마크 아이콘)
- 공유 버튼 (공유 아이콘)
- 각 기사의 "자세히 보기" 링크

### 정보 표시
- 구독자 수 (자동 포맷팅: 1.5만)
- 조회수 (자동 포맷팅)
- 읽는 시간
- 카테고리 배지
- 태그

### 푸터
- 구독 해지 링크
- 설정 변경 링크
- 문의하기 링크
- 저작권 정보

## 예시 페이지

`/newsletter/template` 경로에서 템플릿 미리보기 페이지를 확인할 수 있습니다.

## 커스터마이징

### 색상 변경
```jsx
// 주요 색상 클래스 수정
className="text-blue-600" // 링크 색상
className="text-red-500"   // 좋아요 색상
className="text-blue-500"  // 북마크 색상
```

### 레이아웃 수정
```jsx
// 최대 너비 변경
className="max-w-4xl mx-auto p-4" // 현재 설정
className="max-w-6xl mx-auto p-4" // 더 넓게
```

### 폰트 변경
```jsx
// 제목 폰트
className="text-2xl font-bold text-gray-900"
// 본문 폰트
className="text-gray-600 text-sm leading-relaxed"
```

## 접근성

- 모든 버튼에 적절한 aria-label 제공
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 준수

## 성능 최적화

- 이미지 lazy loading
- 컴포넌트 메모이제이션
- 불필요한 리렌더링 방지
- 최적화된 번들 크기 