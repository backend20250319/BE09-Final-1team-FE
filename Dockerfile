# ===========================================
# 1단계: Builder Stage (의존성 설치 및 빌드)
# ===========================================
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 캐시 최적화를 위해 package.json과 lock 파일을 먼저 복사
COPY package*.json ./

# 프로덕션 빌드에 필요한 모든 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Next.js 애플리케이션 빌드
RUN npm run build

# ===========================================
# 2단계: Final Stage (실제 실행 환경)
# ===========================================
FROM node:20-alpine AS runner

# 작업 디렉토리 설정
WORKDIR /app

# 프로덕션 환경 변수 설정
ENV NODE_ENV=production
# Next.js의 익명 원격 측정 비활성화
ENV NEXT_TELEMETRY_DISABLED=1

# 보안 강화를 위해 non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Builder Stage에서 standalone 빌드 결과물만 복사
# public 폴더, static 파일, standalone 서버 파일을 복사합니다.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# nextjs 사용자로 전환
USER nextjs

# 포트 노출 (Next.js 기본 포트)
EXPOSE 3000

# 환경 변수로 포트 설정
ENV PORT=3000

# 애플리케이션 시작 (standalone 모드는 내장된 server.js를 실행)
CMD ["node", "server.js"]
