# NewSphere - 뉴스 플랫폼

모던하고 반응형인 뉴스 플랫폼으로, 사용자 친화적인 인터페이스와 다양한 기능을 제공합니다.

## 🚀 주요 기능

### 🔐 권한 관리 시스템
- **관리자/사용자 구분**: 역할 기반 접근 제어 (RBAC)
- **미들웨어 보안**: Next.js middleware를 통한 서버 사이드 권한 체크
- **쿠키 기반 인증**: 안전한 쿠키 기반 사용자 역할 관리
- **동적 UI**: 로그인 상태에 따른 헤더 및 페이지 내용 변경

### 📰 뉴스 관리
- **카테고리별 필터링**: 정치, 경제, 사회, IT/과학, 스포츠, 문화 카테고리 지원
- **성능 최적화**: `useMemo`를 활용한 필터링 캐싱으로 빠른 응답 속도
- **상세 페이지 링크**: `prefetch={false}`로 초기 로딩 최적화
- **관련 기사 추천**: 카테고리, 키워드, 무작위 정렬 등 다양한 전략 지원

### 💬 커뮤니티 기능
- **댓글 시스템**: 계층형 댓글과 답글 기능
- **좋아요/공유**: 사용자 상호작용 기능
- **실시간 업데이트**: `useMutation` 준비된 구조

### 🎨 UI/UX 개선
- **다크모드 지원**: 완전한 다크모드 테마와 부드러운 전환 애니메이션
- **Glass UI**: 모던한 글래스모피즘 디자인
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
- **애니메이션**: 부드러운 hover 효과와 로딩 애니메이션

### 🌤️ 실시간 기능
- **날씨 위젯**: 실시간 날씨 정보와 상세 기상 데이터
- **인기 키워드**: 실시간 트렌딩 토픽
- **뉴스레터 구독**: 카테고리별 맞춤 뉴스레터

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Radix UI, Lucide React
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Theme**: next-themes (다크모드 지원)

## 📁 프로젝트 구조

```
news2/
├── app/                    # Next.js App Router
│   ├── page.jsx           # 메인 페이지
│   ├── admin/             # 관리자 전용 페이지
│   ├── user/              # 사용자 전용 페이지
│   ├── login/             # 로그인 페이지
│   ├── unauthorized/      # 권한 없음 페이지
│   ├── community/         # 커뮤니티 페이지
│   ├── newsletter/        # 뉴스레터 페이지
│   ├── mypage/           # 마이페이지
│   └── globals.css       # 전역 스타일
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── header.jsx        # 헤더 컴포넌트 (로그인 상태 반영)
│   ├── CommentSection.jsx # 댓글 시스템
│   ├── WeatherWidget.jsx # 날씨 위젯
│   └── theme-provider.jsx # 테마 관리
├── lib/                  # 유틸리티 및 서비스
│   ├── auth.js           # 권한 관리 유틸리티
│   ├── newsService.js    # 뉴스 데이터 관리
│   ├── relatedArticles.js # 관련 기사 처리
│   └── utils.ts          # 공통 유틸리티
├── middleware.ts          # Next.js 미들웨어 (권한 체크)
└── public/               # 정적 파일
```

## 🚀 성능 최적화

### 1. 카테고리 필터링 최적화
```javascript
// useMemo를 활용한 필터링 캐싱
const filteredNewsItems = useMemo(() => {
  if (selectedCategory === "전체") {
    return newsItems
  }
  return newsItems.filter(item => item.category === selectedCategory)
}, [selectedCategory, newsItems])
```

### 2. 상세 페이지 링크 최적화
```javascript
// prefetch={false}로 초기 로딩 최적화
<Link href={`/news/${news.id}`} prefetch={false}>
  <TextWithTooltips text={news.title} />
</Link>
```

### 3. 관련 기사 알고리즘
- **카테고리 기반**: 동일 카테고리 기사 추천
- **키워드 기반**: 텍스트 분석을 통한 유사도 계산
- **무작위 정렬**: Fisher-Yates 셔플 알고리즘 적용

## 🌙 다크모드 지원

### 테마 전환 기능
- 시스템 테마 자동 감지
- 부드러운 전환 애니메이션
- 모든 컴포넌트 다크모드 대응

### CSS 변수 시스템
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

## 📊 데이터 관리

### 뉴스 서비스 레이어
- **캐싱 시스템**: 5분 캐시로 API 호출 최소화
- **에러 핸들링**: 네트워크 오류 시 더미 데이터 제공
- **SWR/RTK Query 준비**: 실제 API 연동 시 쉽게 이전 가능

### 관련 기사 알고리즘
```javascript
// 다양한 전략 지원
export function getRelatedArticles(allArticles, currentArticle, strategy = 'category', limit = 3) {
  switch (strategy) {
    case 'random':
      return getRandomRelatedArticles(allArticles, currentArticle.id, limit)
    case 'keywords':
      return getRelatedArticlesByKeywords(allArticles, keywords, currentArticle.id, limit)
    case 'category':
    default:
      return getRelatedArticlesByCategory(allArticles, currentArticle.category, currentArticle.id, limit)
  }
}
```

## 🔐 권한 관리 시스템

### 역할 기반 접근 제어 (RBAC)
- **관리자 (admin)**: 전체 시스템 관리, 사용자 관리, 뉴스레터 관리
- **일반 사용자 (user)**: 뉴스 읽기, 뉴스레터 구독, 개인 설정

### 보안 구현
```javascript
// middleware.ts - 서버 사이드 권한 체크
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (pathname.startsWith("/admin")) {
    const role = request.cookies.get("userRole")?.value
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }
  return NextResponse.next()
}
```

### 인증 시스템
```javascript
// lib/auth.js - 권한 관리 유틸리티
export function login(email, password) {
  if (email === "admin@example.com" && password === "admin123") {
    setUserRole("admin")
    return { success: true, role: "admin" }
  } else if (email === "user@example.com" && password === "user123") {
    setUserRole("user")
    return { success: true, role: "user" }
  }
}
```

### 테스트 계정
- **관리자**: admin@example.com / admin123
- **일반 사용자**: user@example.com / user123

## 🌤️ 실시간 날씨 위젯

### 기능
- 실시간 날씨 정보 표시
- 상세 기상 데이터 (습도, 풍속, 기압 등)
- 자외선 지수 및 일출/일몰 시간
- 30분마다 자동 업데이트

### API 연동 준비
```javascript
// OpenWeatherMap API 연동 준비
export class WeatherService {
  async getWeather(city = 'Seoul') {
    const response = await fetch(
      `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=kr`
    )
    // ...
  }
}
```

## 🎯 향후 개선 계획

### 1. API 연동
- [ ] SWR 또는 RTK Query 도입
- [ ] 실제 뉴스 API 연동
- [ ] 날씨 API 연동 (OpenWeatherMap)

### 2. 성능 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅
- [ ] 서비스 워커 도입

### 3. 사용자 경험
- [ ] 무한 스크롤
- [ ] 검색 기능 강화
- [ ] 개인화 추천 시스템

### 4. 기능 확장
- [ ] 실시간 알림
- [ ] 북마크 기능
- [ ] 소셜 공유 기능

### 5. 보안 강화
- [ ] JWT 토큰 기반 인증
- [ ] 세션 관리
- [ ] 비밀번호 암호화
- [ ] 2단계 인증 (2FA)

## 🔧 환경변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 환경변수들을 설정해주세요:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database (if needed)
DATABASE_URL=your-database-url-here

# External APIs (if needed)
NEWS_API_KEY=your-news-api-key-here
WEATHER_API_KEY=your-weather-api-key-here

# Environment
NODE_ENV=development
```

### 환경변수 설명
- `NEXT_PUBLIC_API_BASE_URL`: 백엔드 API 기본 URL
- `NEXT_PUBLIC_BACKEND_URL`: 백엔드 서버 URL
- `NEXTAUTH_SECRET`: NextAuth.js 시크릿 키 (랜덤 문자열 생성 권장)
- `NEXTAUTH_URL`: 애플리케이션 URL
- `DATABASE_URL`: 데이터베이스 연결 문자열
- `NEWS_API_KEY`: 뉴스 API 키 (선택사항)
- `WEATHER_API_KEY`: 날씨 API 키 (선택사항)

> ⚠️ **중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다. 각 개발자가 로컬에서 개별적으로 설정해야 합니다.

### 환경변수 적용 완료 ✅

프로젝트에서 하드코딩된 API URL들을 환경변수로 변경했습니다:

- `lib/config.js`: 환경변수 관리 설정 파일 생성
- `lib/auth.js`: 로그인 API 호출을 환경변수 사용으로 변경
- `components/SubscribeForm.jsx`: 구독 API 호출을 환경변수 사용으로 변경
- `components/WeatherWidget.jsx`: 날씨 API 키를 환경변수에서 가져오도록 변경
- `app/(auth)/auth/_components/SignupForm.jsx`: 회원가입 및 구독 API 호출을 환경변수 사용으로 변경
- `app/(newsletter)/newsletter/dashboard/page.jsx`: 구독자 목록 API 호출을 환경변수 사용으로 변경
- `app/(admin)/admin/newsletter/dashboard/page.jsx`: 관리자 구독자 목록 API 호출을 환경변수 사용으로 변경

이제 모든 API 호출이 환경변수를 통해 안전하게 관리됩니다.

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📝 라이선스

MIT License

---

**NewSphere** - 모던한 뉴스 플랫폼으로 더 나은 뉴스 경험을 제공합니다.
