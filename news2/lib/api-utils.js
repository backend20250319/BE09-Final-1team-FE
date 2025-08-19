/**
 * API 연결 및 디버깅 유틸리티
 */
import { getApiUrl } from "./config";

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
 * 안전한 API 호출 함수
 */
export async function safeApiCall(endpoint, options = {}) {
  // '/api/*' 형태는 Next.js rewrites를 통해 프록시(무CORS)로 호출
  // 절대 URL은 그대로 사용, 그 외에는 중앙 설정 빌더 사용
  let url = endpoint;
  if (endpoint.startsWith("/api/")) {
    url = endpoint; // 상대 경로 유지 -> next.config.mjs rewrites 적용
  } else if (!endpoint.startsWith("http")) {
    url = getApiUrl(endpoint);
  }

  try {
    const response = await fetch(url, {
      ...apiConfig,
      ...options,
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", endpoint, parseError);
      console.error("📄 응답 텍스트:", text);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

    return data;
  } catch (error) {
    if (error.status === 403) {
      throw error;
    }

    console.error("❌ API 호출 실패:", endpoint, error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error("🌐 네트워크 연결 문제 가능성");
    }
    throw error;
  }
}
