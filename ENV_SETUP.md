# 🌍 환경 변수 설정 가이드

이 문서는 NewSphere 프로젝트의 환경 변수 설정 방법을 상세히 설명합니다.

## 📋 목차

1. [환경별 파일 구조](#환경별-파일-구조)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [개발 서버 환경 설정](#개발-서버-환경-설정)
4. [운영 서버 환경 설정](#운영-서버-환경-설정)
5. [보안 가이드라인](#보안-가이드라인)
6. [문제 해결](#문제-해결)

## 📁 환경별 파일 구조

```
news2/
├── .env.local          # 로컬 개발용 (Git에 커밋되지 않음)
├── .env.development    # 개발 서버용 (Git에 커밋되지 않음)
├── .env.production     # 운영 서버용 (Git에 커밋되지 않음)
└── .env.example        # 환경변수 예시 (Git에 커밋됨)
```

## 🏠 로컬 개발 환경 설정

### 1. .env.local 파일 생성

프로젝트 루트 디렉토리(`news2/`)에 `.env.local` 파일을 생성하세요:

```bash
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=NewSphere

# 인증 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-secret-key-123

# 데이터베이스 설정 (로컬)
DATABASE_URL=postgresql://localhost:5432/newsphere_local

# 외부 API 키 (로컬 개발용)
OPENAI_API_KEY=your-openai-api-key-here
NEWS_API_KEY=your-news-api-key-here
WEATHER_API_KEY=your-weather-api-key-here

# 이메일 설정 (로컬)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test@example.com
SMTP_PASS=test-password

# 로깅 설정
LOG_LEVEL=debug
NODE_ENV=development
```

### 2. 로컬 개발용 설정 설명

- **API URL**: 로컬 백엔드 서버 주소
- **인증**: 로컬 개발용 시크릿 키 (실제 운영에서는 강력한 키 사용)
- **데이터베이스**: 로컬 PostgreSQL 데이터베이스
- **외부 API**: 개발용 API 키 (실제 키 또는 테스트 키)
- **이메일**: 로컬 SMTP 서버 (MailHog, Mailtrap 등)

## 🚀 개발 서버 환경 설정

### 1. .env.development 파일 생성

```bash
# API 설정
NEXT_PUBLIC_API_URL=https://dev-api.example.com
NEXT_PUBLIC_APP_NAME=NewSphere (Dev)

# 인증 설정
NEXTAUTH_URL=https://dev.newsphere.com
NEXTAUTH_SECRET=dev-secret-key-456

# 데이터베이스 설정 (개발)
DATABASE_URL=postgresql://dev-user:dev-pass@dev-db:5432/newsphere_dev

# 외부 API 키 (개발용)
OPENAI_API_KEY=dev-openai-api-key
NEWS_API_KEY=dev-news-api-key
WEATHER_API_KEY=dev-weather-api-key

# 이메일 설정 (개발)
SMTP_HOST=dev-smtp.example.com
SMTP_PORT=587
SMTP_USER=dev@newsphere.com
SMTP_PASS=dev-smtp-password

# 로깅 설정
LOG_LEVEL=info
NODE_ENV=development
```

### 2. 개발 서버용 설정 설명

- **API URL**: 개발 서버 API 주소
- **인증**: 개발 환경용 시크릿 키
- **데이터베이스**: 개발 전용 데이터베이스
- **외부 API**: 개발용 API 키 (실제 키 사용 가능)
- **이메일**: 개발용 SMTP 서버

## 🌐 운영 서버 환경 설정

### 1. .env.production 파일 생성

```bash
# API 설정
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=NewSphere

# 인증 설정
NEXTAUTH_URL=https://newsphere.com
NEXTAUTH_SECRET=prod-secret-key-789

# 데이터베이스 설정 (운영)
DATABASE_URL=postgresql://prod-user:prod-pass@prod-db:5432/newsphere_prod

# 외부 API 키 (운영용)
OPENAI_API_KEY=prod-openai-api-key
NEWS_API_KEY=prod-news-api-key
WEATHER_API_KEY=prod-weather-api-key

# 이메일 설정 (운영)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@newsphere.com
SMTP_PASS=prod-smtp-password

# 로깅 설정
LOG_LEVEL=warn
NODE_ENV=production
```

### 2. 운영 서버용 설정 설명

- **API URL**: 운영 서버 API 주소
- **인증**: 강력한 운영용 시크릿 키
- **데이터베이스**: 운영 전용 데이터베이스
- **외부 API**: 운영용 API 키 (실제 키)
- **이메일**: 운영용 SMTP 서버

## 🔐 보안 가이드라인

### 1. 파일 권한 설정

```bash
# 환경 변수 파일 권한 설정 (Unix/Linux/macOS)
chmod 600 .env.local
chmod 600 .env.development
chmod 600 .env.production
```

### 2. 시크릿 키 생성

```bash
# 강력한 시크릿 키 생성 (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 도구 사용
# https://generate-secret.vercel.app/32
```

### 3. API 키 관리

- **개발용**: 테스트 API 키 또는 제한된 권한의 키 사용
- **운영용**: 실제 API 키 사용, 정기적으로 로테이션
- **백업**: API 키를 안전한 곳에 백업 (1Password, LastPass 등)

### 4. 환경 변수 검증

```javascript
// lib/config.js에서 환경 변수 검증
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## 🛠️ 문제 해결

### 1. 환경 변수가 로드되지 않는 경우

```bash
# Next.js 서버 재시작
npm run dev

# 또는 캐시 클리어
rm -rf .next
npm run dev
```

### 2. API 연결 오류

```bash
# API URL 확인
echo $NEXT_PUBLIC_API_URL

# 네트워크 연결 테스트
curl $NEXT_PUBLIC_API_URL/health
```

### 3. 인증 오류

```bash
# NEXTAUTH 설정 확인
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# 시크릿 키 재생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 데이터베이스 연결 오류

```bash
# 데이터베이스 URL 확인
echo $DATABASE_URL

# PostgreSQL 연결 테스트
psql $DATABASE_URL -c "SELECT 1;"
```

## 📚 추가 리소스

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)


## 🔄 업데이트 로그

- **2024-01-XX**: 초기 환경 변수 설정 가이드 작성
- **2024-01-XX**: 보안 가이드라인 추가
- **2024-01-XX**: 문제 해결 섹션 추가

---

**⚠️ 주의**: 이 문서의 내용은 프로젝트의 보안에 직접적인 영향을 미치므로, 팀원들과 공유하기 전에 검토하시기 바랍니다.
