// 게이트웨이 절대 URL 생성 (SSR/SSG/Route Handler에서 안전)
export function apiUrl(path: string) {
  const base = process.env.API_BASE_URL || 'http://localhost:8000';
  return new URL(path.startsWith('/') ? path : `/${path}`, base).toString();
}

// 앱(프론트) 자체 절대 URL - 상대경로 SSG 오류 방지용
export function siteUrl(path: string) {
  const port = process.env.PORT ?? '3001';
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);
  return new URL(path.startsWith('/') ? path : `/${path}`, base).toString();
}

// 게이트웨이 URL 확인 (디버깅용)
export function getGatewayUrl() {
  return process.env.API_BASE_URL || 'http://localhost:8000';
}

// 환경별 URL 설정 확인
export function getEnvironmentInfo() {
  return {
    gateway: getGatewayUrl(),
    site: process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT ?? '3001'}`,
    nodeEnv: process.env.NODE_ENV,
    isServer: typeof window === 'undefined',
  };
}
