# 환경변수 설정 가이드

## 필수 환경변수

### 백엔드 연결
```bash
# 서버 전용 (브라우저에 노출되지 않음) - BFF에서 사용
BACKEND_URL=http://localhost:8000

# 클라이언트용 (브라우저에서 접근 가능) - 게이트웨이
NEXT_PUBLIC_API_URL=http://localhost:8000

# ⚠️ DEPRECATED: 클라이언트에서 직접 백엔드 호출 시 사용 (제거 예정)
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 기타 설정
```bash
# Next.js 설정
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API 키 (필요시)
NEXT_PUBLIC_API_KEY=your_api_key_here
```

## 서비스 포트 정보

- **게이트웨이**: 8000 (메인 API 진입점)
- **뉴스 서비스**: 8082
- **Next.js 프론트엔드**: 3000

## BFF 패턴 적용 후 변경사항

### ✅ 권장 방식 (현재 표준)
- **클라이언트**: `newsletterService.js` → Next.js API Route 호출
- **서버**: Next.js API Route → `BACKEND_URL`(8000)로 게이트웨이 호출
- **보안**: 백엔드 URL이 브라우저에 노출되지 않음

### ❌ 사용 금지 (제거 예정)
- **클라이언트**: 직접 `NEXT_PUBLIC_BACKEND_URL` 호출
- **문제점**: CORS, 토큰 노출, 보안 위험

## 마이그레이션 체크리스트

- [ ] `BACKEND_URL=http://localhost:8000` 환경변수 설정
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:8000` 환경변수 설정
- [ ] `NEXT_PUBLIC_BACKEND_URL` 제거 (선택사항)
- [ ] 클라이언트 코드에서 `newsletterService.js`만 사용
- [ ] 직접 백엔드 호출 코드 제거
