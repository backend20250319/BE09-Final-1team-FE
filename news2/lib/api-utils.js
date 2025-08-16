/**
 * API 연결 및 디버깅 유틸리티
 */
import { getApiUrl } from "./config";
import { z } from "zod";

// 캐시 저장소
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

/**
 * 캐시 유틸리티
 */
const cacheUtils = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
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
  
  delete: (key) => cache.delete(key)
};

/**
 * 백엔드 서버 연결 상태를 확인합니다
 */
export async function checkBackendHealth() {
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
 */
export function testApiUrl(endpoint = "") {
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
 */
export async function checkNetworkConnectivity() {
  try {
    // 간단한 네트워크 테스트
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
 */
export async function diagnoseCorsIssue() {
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
 * API 호출을 위한 공통 설정
 */
export const apiConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  mode: "cors",
  credentials: "omit",
};

/**
 * Zod 스키마로 응답 데이터 검증
 */
export function validateResponse(data, schema) {
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
 * 안전한 API 호출 함수 (개선된 버전)
 */
export async function safeApiCall(endpoint, options = {}) {
  const { 
    schema, 
    cacheKey, 
    useCache = false, 
    method = "GET",
    body,
    ...restOptions 
  } = options;

  // 캐시 확인 (GET 요청만)
  if (useCache && method === "GET" && cacheKey) {
    const cachedData = cacheUtils.get(cacheKey);
    if (cachedData) {
      console.log("📦 캐시된 데이터 사용:", cacheKey);
      return cachedData;
    }
  }

  // '/api/*' 형태는 Next.js rewrites를 통해 프록시(무CORS)로 호출
  // 절대 URL은 그대로 사용, 그 외에는 중앙 설정 빌더 사용
  let url = endpoint;
  if (endpoint.startsWith("/api/")) {
    url = endpoint; // 상대 경로 유지 -> next.config.mjs rewrites 적용
  } else if (!endpoint.startsWith("http")) {
    url = getApiUrl(endpoint);
  }

  try {
    console.log("🔄 API 호출:", url, { method });

    const requestOptions = {
      ...apiConfig,
      method,
      ...restOptions,
    };

    // POST/PUT/PATCH 요청에 body 추가
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
      
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // 응답 본문이 비어있는지 확인
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.log("✅ API 호출 성공 (빈 응답):", endpoint);
      return null;
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", endpoint, parseError);
      console.error("📄 응답 텍스트:", text);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    // 스키마 검증
    const validation = validateResponse(data, schema);
    if (!validation.success) {
      throw new Error(validation.error);
    }

    // 캐시 저장 (GET 요청만)
    if (useCache && method === "GET" && cacheKey && validation.data) {
      cacheUtils.set(cacheKey, validation.data);
    }

    console.log("✅ API 호출 성공:", endpoint);
    return validation.data;
  } catch (error) {
    console.error("❌ API 호출 실패:", endpoint, error);
    // 네트워크 오류나 기타 예외 상황에 대한 추가 정보 제공
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error("🌐 네트워크 연결 문제 가능성");
    }
    throw error;
  }
}

/**
 * GET 요청 전용 함수
 */
export async function apiGet(endpoint, options = {}) {
  return safeApiCall(endpoint, { method: "GET", ...options });
}

/**
 * POST 요청 전용 함수
 */
export async function apiPost(endpoint, body, options = {}) {
  return safeApiCall(endpoint, { method: "POST", body, ...options });
}

/**
 * PUT 요청 전용 함수
 */
export async function apiPut(endpoint, body, options = {}) {
  return safeApiCall(endpoint, { method: "PUT", body, ...options });
}

/**
 * DELETE 요청 전용 함수
 */
export async function apiDelete(endpoint, options = {}) {
  return safeApiCall(endpoint, { method: "DELETE", ...options });
}

/**
 * 캐시 관리 함수들
 */
export const cacheManager = {
  get: cacheUtils.get,
  set: cacheUtils.set,
  clear: cacheUtils.clear,
  delete: cacheUtils.delete,
  invalidateByPattern: (pattern) => {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  }
};

// 기존 함수들도 유지 (하위 호환성)
export { cacheUtils as cache };