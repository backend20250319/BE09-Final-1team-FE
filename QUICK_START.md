# 🚀 팀원들을 위한 빠른 시작 가이드

이 문서는 NewSphere 프로젝트에 새로 합류한 팀원들을 위한 빠른 설정 가이드입니다.

## 📋 필수 요구사항

- Node.js 18+ 
- npm 또는 pnpm
- Git

## 🔄 프로젝트 설정 (3단계)

### 1️⃣ 프로젝트 클론
```bash
git clone [프로젝트_저장소_URL]
cd BE09-Final-1team-FE/news2
```

### 2️⃣ 원클릭 설정 (추천)
```bash
# 의존성 설치 + 환경 변수 설정을 한 번에!
npm run setup
```

### 3️⃣ 개발 서버 시작
```bash
npm run dev
```

🎉 **완료!** 이제 http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

---

## 🔧 수동 설정 (선택사항)

원클릭 설정이 작동하지 않는 경우:

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 파일 생성
npm run setup:env:local

# 3. 개발 서버 시작
npm run dev
```

## ⚙️ 환경 변수 설정

`npm run setup` 명령어로 자동 생성된 `.env.local` 파일에서 다음 값들을 실제 값으로 변경하세요:

```bash
# .env.local 파일 편집
OPENAI_API_KEY=실제_OpenAI_API_키
NEWS_API_KEY=실제_뉴스_API_키
WEATHER_API_KEY=실제_날씨_API_키
DATABASE_URL=실제_데이터베이스_URL
```

## 🐛 문제 해결

### 환경 변수 파일이 생성되지 않는 경우
```bash
# 스크립트 직접 실행
node scripts/setup-env.js local
```

### 의존성 설치 오류
```bash
# 캐시 클리어 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 개발 서버 시작 오류
```bash
# Next.js 캐시 클리어
rm -rf .next
npm run dev
```

## 📚 추가 문서

- `README.md`: 프로젝트 전체 가이드
- `ENV_SETUP.md`: 상세한 환경 변수 설정 가이드

## 💬 도움이 필요한 경우

1. 이 문서를 다시 읽어보세요
2. `ENV_SETUP.md` 파일을 확인하세요
3. 팀 리더에게 문의하세요

---

**🎯 목표**: 5분 안에 개발 환경 설정 완료!
