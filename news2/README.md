# NewSphere - 뉴스 플랫폼

현대적인 뉴스 플랫폼으로, 실시간 뉴스 검색, 키워드 구독, AI 요약 등의 기능을 제공합니다.

## 🚀 주요 기능

### 🔍 통합 검색 시스템
- **헤더 자동완성 검색**: 타이핑 시 실시간 검색 제안
- **키보드 네비게이션**: 화살표 키로 검색 결과 탐색
- **검색 결과 페이지**: 탭별 정렬 (최신순/언론사별/카테고리별)
- **페이지네이션**: 효율적인 결과 탐색

### 📊 실시간 키워드 위젯
- **트렌딩 키워드**: 실시간 인기 키워드 표시
- **클릭 검색**: 키워드 클릭 시 검색 페이지로 이동
- **순위 변화**: 키워드 순위 변화 시각화
- **자동 새로고침**: 주기적 데이터 업데이트

### 🔗 연관 기사 시스템
- **자동 연관 기사**: 제목 키워드 기반 관련 기사 추천
- **사이드바 표시**: 뉴스 상세 페이지에서 연관 기사 확인
- **키워드 추출**: 제목에서 주요 키워드 자동 추출
- **더보기 기능**: 연관 기사 검색 페이지로 이동

### 📧 키워드 구독 시스템
- **키워드 구독**: 관심 키워드 구독 관리
- **구독 목록**: 사용자별 구독 키워드 조회
- **구독 취소**: 언제든지 구독 해제 가능
- **알림 준비**: 향후 푸시/메일 알림 기능 확장 예정

### 🎨 현대적인 UI/UX
- **Glass Morphism**: 모던한 글래스 효과 디자인
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- **다크 모드 지원**: 사용자 선호도에 따른 테마 변경
- **애니메이션**: 부드러운 전환 효과

## 🛠 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Shadcn/ui**: 모던한 UI 컴포넌트 라이브러리
- **Lucide React**: 아이콘 라이브러리

### Backend Integration
- **Spring Boot**: Java 백엔드 API
- **프록시 API**: Next.js API Routes를 통한 백엔드 연동
- **환경 변수**: `BACKEND_URL` 설정으로 백엔드 연결

### 상태 관리
- **React Hooks**: useState, useEffect 등
- **Context API**: 전역 상태 관리
- **Custom Hooks**: 재사용 가능한 로직

## 📁 프로젝트 구조

```
news2/
├── app/                    # Next.js App Router
│   ├── (news)/            # 뉴스 관련 페이지
│   ├── api/               # API Routes
│   │   ├── news/          # 뉴스 API
│   │   └── subscribe/     # 구독 API
│   └── search/            # 검색 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── SearchAutocomplete.jsx
│   ├── RealTimeKeywordWidget.tsx
│   ├── RelatedArticles.jsx
│   └── KeywordSubscription.jsx
├── lib/                  # 유틸리티 함수
└── public/               # 정적 파일
```

## 🚀 시작하기

### 1. 환경 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd news2

# 의존성 설치
npm install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Spring Boot 백엔드 API URL
BACKEND_URL=http://localhost:8080

# Next.js 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속

## 🔧 API 엔드포인트

### 뉴스 검색 API
```
GET /api/news/search?query={검색어}&page={페이지}&size={크기}
```

### 트렌딩 키워드 API
```
GET /api/news/trending-keywords?limit={개수}&period={기간}
```

### 키워드 구독 API
```
POST /api/subscribe/keywords
GET /api/subscribe/keywords?userId={사용자ID}
DELETE /api/subscribe/keywords?id={구독ID}
```

## 🎯 주요 컴포넌트

### SearchAutocomplete
- 헤더 통합 검색 기능
- 실시간 자동완성
- 키보드 네비게이션 지원

### RealTimeKeywordWidget
- 실시간 트렌딩 키워드 표시
- 클릭 시 검색 페이지 이동
- 순위 변화 애니메이션

### RelatedArticles
- 뉴스 상세 페이지 연관 기사
- 키워드 기반 자동 추천
- 사이드바 레이아웃

### KeywordSubscription
- 키워드 구독 관리
- 구독 목록 표시
- 구독/해제 기능

## 🔄 백엔드 연동

### 프록시 API 구조
- Next.js API Routes가 Spring Boot 백엔드로 요청을 프록시
- 환경 변수로 백엔드 URL 설정
- 에러 처리 및 폴백 데이터 제공

### 데이터 흐름
1. 프론트엔드 → Next.js API Routes
2. Next.js API Routes → Spring Boot 백엔드
3. Spring Boot 백엔드 → 데이터베이스
4. 응답 역순으로 반환

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Blue (#3B82F6)
- **Secondary**: Green (#10B981)
- **Accent**: Purple (#8B5CF6)
- **Neutral**: Gray (#6B7280)

### 컴포넌트 스타일
- **Glass Effect**: backdrop-blur와 투명도
- **Hover Effects**: 부드러운 전환 애니메이션
- **Responsive**: 모바일 퍼스트 디자인

## 🚀 향후 계획

### 단기 목표
- [ ] 사용자 인증 시스템 완성
- [ ] 뉴스 스크랩 기능
- [ ] 댓글 시스템
- [ ] 소셜 공유 기능

### 중기 목표
- [ ] AI 기반 개인화 추천
- [ ] 실시간 알림 시스템
- [ ] 다국어 지원
- [ ] PWA 지원

### 장기 목표
- [ ] 마이크로서비스 아키텍처
- [ ] 실시간 뉴스 스트리밍
- [ ] 고급 분석 대시보드
- [ ] 모바일 앱 개발

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**NewSphere** - 현대적인 뉴스 경험을 제공합니다 📰✨
