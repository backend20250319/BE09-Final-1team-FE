// 환경변수 설정
export const config = {
  // API 설정
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082',
    backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082',
  },
  
  // 인증 설정
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // 외부 API 설정
  external: {
    newsApiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY,
    weatherApiKey: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
  },
  
  // 환경 설정
  env: process.env.NODE_ENV || 'development',
}

// API URL 생성 헬퍼 함수
export const getApiUrl = (endpoint) => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '') // 끝의 슬래시 제거
  const cleanEndpoint = endpoint.replace(/^\//, '') // 시작의 슬래시 제거
  return `${baseUrl}/${cleanEndpoint}`
}

// 백엔드 URL 생성 헬퍼 함수
export const getBackendUrl = (endpoint) => {
  const baseUrl = config.api.backendUrl.replace(/\/$/, '') // 끝의 슬래시 제거
  const cleanEndpoint = endpoint.replace(/^\//, '') // 시작의 슬래시 제거
  return `${baseUrl}/${cleanEndpoint}`
} 