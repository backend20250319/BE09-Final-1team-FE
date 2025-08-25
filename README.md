# 뉴스포털 - SSR + React Query 조합 프로젝트

## 🚀 프로젝트 개요

이 프로젝트는 Next.js 14의 App Router와 React Query를 조합하여 최적의 사용자 경험을 제공하는 뉴스포털입니다.

## 🎯 SSR + React Query 조합의 장점

### ✅ SEO 최적화
- **서버 사이드 렌더링 (SSR)**: 검색엔진이 완성된 HTML을 받아 SEO 점수 향상
- **메타데이터**: 각 페이지별로 최적화된 메타데이터 제공
- **소셜 미리보기**: Open Graph 태그로 소셜 미디어 공유 최적화

### ✅ 빠른 초기 로딩
- **서버에서 초기 데이터 로드**: 첫 화면에 데이터가 이미 포함되어 표시
- **React Query 캐싱**: 클라이언트에서 중복 요청 방지
- **자동 백그라운드 업데이트**: 사용자가 페이지에 머물면서 최신 데이터 자동 갱신

### ✅ 실시간 상호작용
- **실시간 데이터 업데이트**: 10분마다 자동으로 뉴스레터 목록 갱신
- **즉시 반응**: 구독/해제 버튼 클릭 시 즉시 UI 업데이트
- **에러 처리**: 자동 재시도 및 사용자 친화적 에러 메시지

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Server Side   │    │  Client Side    │    │   React Query   │
│                 │    │                 │    │                 │
│ • 초기 데이터   │───▶│ • UI 렌더링     │◀──▶│ • 캐시 관리     │
│ • SEO 메타데이터│    │ • 사용자 상호작용│    │ • 백그라운드 업데이트│
│ • 서버 컴포넌트 │    │ • 클라이언트 컴포넌트│    │ • 에러 처리     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 프로젝트 구조

```
news2/
├── app/
│   ├── (newsletter)/
│   │   └── newsletter/
│   │       ├── page.jsx              # 서버 컴포넌트 (SSR)
│   │       └── NewsletterPageClient.jsx # 클라이언트 컴포넌트 (React Query)
│   └── (api)/
│       └── api/
│           └── newsletters/
│               ├── route.js          # 뉴스레터 목록 API
│               ├── subscribe/
│               │   └── route.js      # 구독 API
│               ├── unsubscribe/
│               │   └── route.js      # 구독 해제 API
│               └── user-subscriptions/
│                   └── route.js      # 사용자 구독 목록 API
├── hooks/
│   └── useNewsletter.js              # React Query 훅들
├── lib/
│   └── newsletterService.js          # API 서비스
└── layout.jsx                        # React Query Provider 설정
```

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **상태 관리**: React Query (@tanstack/react-query)
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **개발 도구**: React Query DevTools

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
```
http://localhost:3000/newsletter
```

## 🔧 주요 기능

### 📰 뉴스레터 목록
- **SSR로 초기 로딩**: 서버에서 뉴스레터 데이터를 미리 로드
- **실시간 업데이트**: React Query로 10분마다 자동 갱신
- **카테고리 필터링**: 클라이언트에서 즉시 필터링
- **로딩 상태**: 스켈레톤 UI로 부드러운 로딩 경험

### 🔔 구독 관리
- **실시간 구독/해제**: React Query 뮤테이션으로 즉시 반영
- **이메일 검증**: 클라이언트에서 이메일 형식 검증
- **에러 처리**: 사용자 친화적 에러 메시지
- **성공 피드백**: Toast 알림으로 작업 완료 확인

### 📊 사용자 경험
- **반응형 디자인**: 모바일부터 데스크톱까지 최적화
- **애니메이션**: 부드러운 전환 효과
- **접근성**: 키보드 네비게이션 지원
- **성능**: React Query 캐싱으로 빠른 응답

## 🎨 UI/UX 특징

### 🌈 디자인 시스템
- **그라데이션 배경**: 보라색-핑크색-주황색 그라데이션
- **글래스모피즘**: 반투명 카드 디자인
- **호버 효과**: 부드러운 애니메이션
- **아이콘**: Lucide React 아이콘 사용

### 📱 반응형 레이아웃
- **모바일**: 단일 컬럼 레이아웃
- **태블릿**: 2컬럼 그리드
- **데스크톱**: 3컬럼 메인 + 1컬럼 사이드바

## 🔍 개발자 도구

### React Query DevTools
개발 환경에서 브라우저 우측 하단에 React Query DevTools가 표시됩니다:
- **쿼리 상태**: 모든 쿼리의 로딩/성공/에러 상태 확인
- **캐시 데이터**: 캐시된 데이터 실시간 확인
- **뮤테이션**: 구독/해제 작업 상태 모니터링
- **성능**: 쿼리 실행 시간 및 최적화 포인트 확인

## 📈 성능 최적화

### 🚀 SSR + React Query 조합
```jsx
// 1. 서버 컴포넌트에서 초기 데이터 로드
export default async function NewsletterPage() {
  const initialNewsletters = await newsletterService.getNewsletters()
  return <NewsletterPageClient initialNewsletters={initialNewsletters} />
}

// 2. 클라이언트 컴포넌트에서 React Query로 실시간 관리
const { data: newsletters } = useNewsletters({
  initialData: initialNewsletters, // SSR 데이터를 초기값으로 사용
})
```

### ⚡ 캐싱 전략
- **staleTime**: 5분간 fresh 상태 유지
- **cacheTime**: 15분간 캐시 유지
- **refetchInterval**: 10분마다 자동 새로고침
- **refetchOnWindowFocus**: 창 포커스시 새로고침

## 🐛 문제 해결

### 일반적인 이슈
1. **API 에러**: 네트워크 탭에서 API 응답 확인
2. **캐시 문제**: React Query DevTools에서 캐시 상태 확인
3. **로딩 상태**: 개발자 도구에서 네트워크 속도 조절 테스트

### 디버깅 팁
- React Query DevTools 활용
- 브라우저 개발자 도구의 Network 탭 모니터링
- Console에서 에러 로그 확인

## 🔮 향후 개선 계획

- [ ] **실제 데이터베이스 연동**: PostgreSQL/MongoDB 연동
- [ ] **실시간 알림**: WebSocket을 통한 실시간 알림
- [ ] **오프라인 지원**: Service Worker로 오프라인 캐싱
- [ ] **성능 모니터링**: Core Web Vitals 측정
- [ ] **A/B 테스트**: 다양한 UI 패턴 테스트

## 📝 라이선스

MIT License

---

**SSR + React Query 조합으로 최고의 사용자 경험을 제공하는 뉴스포털입니다! 🚀**
