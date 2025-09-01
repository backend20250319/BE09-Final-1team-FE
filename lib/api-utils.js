/**
 * API 연결 및 디버깅 유틸리티 (최종 통합 버전)
 */
import { getApiUrl } from "./config";
import { z } from "zod";

// 캐시 저장소
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분 (캐시 유효 시간)

/**
 * 캐시 유틸리티
 */
const cacheUtils = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;

    // 캐시 유효기간 확인
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      cache.delete(key);
      return null;
    }

    return item.data;
  },

  set: (key, data) => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  clear: () => cache.clear(),

  delete: (key) => cache.delete(key),

  // 특정 패턴을 포함하는 캐시 항목 무효화
  invalidateByPattern: (pattern) => {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  }
};

/**
 * Zod 스키마로 응답 데이터 검증
 * @param {*} data - 검증할 데이터
 * @param {z.ZodSchema} schema - Zod 스키마
 * @returns {{success: boolean, data?: *, error?: string}} - 검증 결과
 */
function validateResponse(data, schema) {
  try {
    if (!schema) return { success: true, data };

    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    console.error("❌ 응답 데이터 검증 실패:", error);
    return {
      success: false,
      error: error.errors?.[0]?.message || "데이터 형식이 올바르지 않습니다"
    };
  }
}

/**
 * API 호출을 위한 공통 설정
 */
const apiConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  mode: "cors",
  credentials: "omit",
};

/**
 * 안전한 API 호출 함수 (통합 버전)
 * @param {string} endpoint - API 엔드포인트 URL
 * @param {object} options - 추가 옵션
 * @param {z.ZodSchema} [options.schema] - 응답 데이터 검증을 위한 Zod 스키마
 * @param {string} [options.cacheKey] - 캐시를 사용할 경우 캐시 키
 * @param {boolean} [options.useCache=false] - 캐시 사용 여부
 * @param {string} [options.method="GET"] - HTTP 메서드
 * @param {*} [options.body] - 요청 본문 (POST, PUT, PATCH용)
 * @param {object} [restOptions] - fetch API에 전달할 나머지 옵션
 * @returns {Promise<*>} - API 응답 데이터
 */
async function safeApiCall(endpoint, options = {}) {
  const {
    schema,
    cacheKey,
    useCache = false,
    method = "GET",
    body,
    ...restOptions
  } = options;

  // 캐시 확인 (GET 요청에만 적용)
  if (useCache && method === "GET" && cacheKey) {
    const cachedData = cacheUtils.get(cacheKey);
    if (cachedData) {
      console.log("📦 캐시된 데이터 사용:", cacheKey);
      return { data: cachedData };
    }
  }

  // URL 처리 로직 (Next.js rewrites와 일반 URL 구성 통합)
  let url = endpoint;
  if (endpoint.startsWith("/api/")) {
    // /api/ 경로는 그대로 두어 Next.js 프록시가 처리하도록 함 (CORS 방지)
    url = endpoint;
  }
  else if (!endpoint.startsWith("http")) {
    // 그 외 경로는 전체 URL로 변환
    url = getApiUrl(endpoint);
  }

  console.log("🔄 API 호출:", url, { method });

    const requestOptions = {
      ...apiConfig,
      method,
      cache: 'no-store',
      next: { revalidate: 0 },
      ...restOptions,
      // 헤더는 아래에서 동적으로 설정하므로 원본을 유지하기 위해 복사해서 사용
      headers: { ...apiConfig.headers },
    };

    // 브라우저 환경에서만 localStorage의 인증 토큰을 헤더에 자동으로 추가
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        requestOptions.headers["Authorization"] = `Bearer ${token}`;
        console.log("🔑 인증 토큰을 헤더에 추가했습니다.");
      } else {
        console.warn("🤔 인증 토큰이 없습니다. 스크랩 등 인증이 필요한 기능은 실패할 수 있습니다.");
      }
    }

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    console.log("📡 응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

    return {
      error: {
        status: response.status,
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      },
    };
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return { data: null };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    console.error("❌ JSON 파싱 실패:", endpoint, parseError);
    return {
      error: {
        status: 'JSON_PARSE_ERROR',
        message: `Invalid JSON response: ${parseError.message}`
      }
    };
  }

  const validation = validateResponse(data, schema);
  if (!validation.success) {
    return {
      error: {
        status: 'VALIDATION_ERROR',
        message: validation.error
      }
    };
  }

  data = validation.data;

  if (useCache && method === "GET" && cacheKey && data) {
    cacheUtils.set(cacheKey, data);
  }

  console.log("✅ API 호출 성공:", endpoint);

  return { data };
}

/**
 * 백엔드 서버 연결 상태를 확인합니다
 * @returns {Promise<{isConnected: boolean, status?: number, statusText?: string, data?: string, error?: string, type?: string}>}
 */
async function checkBackendHealth() {
  try {
    const response = await fetch(getApiUrl("/api/news/health"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "omit",
    });

    return {
      isConnected: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: response.ok ? await response.text() : null,
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error.message,
      type: error.name,
    };
  }
}

/**
 * API URL을 테스트합니다
 * @param {string} endpoint - 테스트할 엔드포인트
 * @returns {string} - 구성된 전체 URL
 */
function testApiUrl(endpoint = "") {
  const url = getApiUrl(endpoint);
  console.log("🔗 API URL 테스트:", {
    endpoint,
    fullUrl: url,
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "설정되지 않음",
    env: process.env.NODE_ENV,
  });
  return url;
}

/**
 * 네트워크 연결 상태를 확인합니다
 * @returns {Promise<{isOnline: boolean, status?: number, error?: string}>}
 */
async function checkNetworkConnectivity() {
  try {
    const response = await fetch("https://httpbin.org/get", {
      method: "GET",
      mode: "cors",
    });
    return {
      isOnline: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      isOnline: false,
      error: error.message,
    };
  }
}

/**
 * CORS 문제를 진단합니다
 * @returns {Promise<{networkConnectivity: object, backendHealth: object, apiUrl: string, environment: object}>}
 */
async function diagnoseCorsIssue() {
  const results = {
    networkConnectivity: await checkNetworkConnectivity(),
    backendHealth: await checkBackendHealth(),
    apiUrl: testApiUrl("/api/news/health"),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      isBrowser: typeof window !== "undefined",
    },
  };

  console.log("🔍 CORS 진단 결과:", results);
  return results;
}

/**
 * GET 요청 전용 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} options - safeApiCall에 전달할 옵션
 * @returns {Promise<*>}
 */
async function apiGet(endpoint, options = {}) {
  return safeApiCall(endpoint, { method: "GET", ...options });
}

/**
 * POST 요청 전용 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {*} body - 요청 본문
 * @param {object} options - safeApiCall에 전달할 옵션
 * @returns {Promise<*>}
 */
async function apiPost(endpoint, body, options = {}) {
  return safeApiCall(endpoint, { method: "POST", body, ...options });
}

/**
 * PUT 요청 전용 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {*} body - 요청 본문
 * @param {object} options - safeApiCall에 전달할 옵션
 * @returns {Promise<*>}
 */
async function apiPut(endpoint, body, options = {}) {
  return safeApiCall(endpoint, { method: "PUT", body, ...options });
}

/**
 * DELETE 요청 전용 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} options - safeApiCall에 전달할 옵션
 * @returns {Promise<*>}
 */
async function apiDelete(endpoint, options = {}) {
  return safeApiCall(endpoint, { method: "DELETE", ...options });
}

/**
 * 캐시 관리 함수들을 묶어서 내보냅니다.
 */
export const cacheManager = {
  get: cacheUtils.get,
  set: cacheUtils.set,
  clear: cacheUtils.clear,
  delete: cacheUtils.delete,
  invalidateByPattern: cacheUtils.invalidateByPattern
};

export {
  safeApiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  checkBackendHealth,
  testApiUrl,
  checkNetworkConnectivity,
  diagnoseCorsIssue,
  validateResponse,
  cacheUtils,
  apiConfig,
};