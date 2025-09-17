// 환경변수 설정
export const config = {
  // API 설정
  api: {
    // 클라이언트용 (브라우저에서 접근 가능)
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // 게이트웨이
    // 개별 서비스 URL은 제거 - 모든 요청은 게이트웨이를 통해
    // newsServiceUrl: process.env.NEXT_PUBLIC_NEWS_SERVICE_URL || 'http://localhost:8082',
    // newsletterServiceUrl: process.env.NEXT_PUBLIC_NEWSLETTER_SERVICE_URL || 'http://localhost:8085',

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
};

// API URL 생성 헬퍼 함수 (클라이언트용)
export const getApiUrl = (endpoint) => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // 끝의 슬래시 제거
  const cleanEndpoint = endpoint.replace(/^\//, ''); // 시작의 슬래시 제거
  return `${baseUrl}/${cleanEndpoint}`;
};

// 뉴스 서비스 URL 생성 헬퍼 함수 - 게이트웨이를 통해 라우팅
export const getNewsServiceUrl = (endpoint) => {
  try {
    const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // 게이트웨이 URL 사용
    const cleanEndpoint = endpoint.replace(/^\//, ''); // 시작의 슬래시 제거
    const fullUrl = `${baseUrl}/${cleanEndpoint}`;
    
    // URL 유효성 검사
    new URL(fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('❌ Invalid URL generated:', { baseUrl: config.api.baseUrl, endpoint, error });
    throw new Error(`Failed to construct URL: ${error.message}`);
  }
};

// 뉴스레터 서비스 URL 생성 헬퍼 함수 - 게이트웨이를 통해 라우팅
export const getNewsletterServiceUrl = (endpoint) => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // 게이트웨이 URL 사용
  const cleanEndpoint = endpoint.replace(/^\//, ''); // 시작의 슬래시 제거
  return `${baseUrl}/${cleanEndpoint}`;
};
