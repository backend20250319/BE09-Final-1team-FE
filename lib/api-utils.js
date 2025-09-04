/**
 * API 연결 및 디버깅 유틸리티 (단순화된 버전)
 */
import { authenticatedFetch } from "./auth";
import { getApiUrl } from "./config";

/**
 * 안전한 API 호출 함수 (authenticatedFetch 기반)
 * 이제 프록시 변환 로직 없이 직접 API 경로를 사용합니다.
 * @param {string} endpoint - API 엔드포인트 URL (ex: "/api/news" or "/api/auth/login")
 * @param {object} options - fetch 옵션
 * @returns {Promise<*>} - API 응답 데이터
 */
async function safeApiCall(endpoint, options = {}) {
  try {
    console.log("� safeApiCall 호출:", endpoint, options);

    // authenticatedFetch를 사용하여 쿠키 인증을 자동으로 처리
    const response = await authenticatedFetch(endpoint, options);

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
          message:
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }

    const text = await response.text();
    if (!text || text.trim() === "") {
      return { data: null };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", endpoint, parseError);
      return {
        error: {
          status: "JSON_PARSE_ERROR",
          message: `Invalid JSON response: ${parseError.message}`,
        },
      };
    }

    console.log("✅ safeApiCall 성공:", endpoint);
    return { data };
  } catch (error) {
    console.error("🚨 safeApiCall 오류:", error);
    return {
      error: {
        status: "NETWORK_ERROR",
        message: error.message,
      },
    };
  }
}

/**
 * 백엔드 서버 연결 상태를 확인합니다
 * @returns {Promise<{isConnected: boolean, status?: number, statusText?: string, data?: string, error?: string, type?: string}>}
 */
async function checkBackendHealth() {
  try {
    const response = await fetch("/api/news/health", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
 * GET 요청 전용 함수
 */
async function apiGet(endpoint, options = {}) {
  return safeApiCall(endpoint, { method: "GET", ...options });
}

/**
 * POST 요청 전용 함수
 */
async function apiPost(endpoint, body, options = {}) {
  return safeApiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * PUT 요청 전용 함수
 */
async function apiPut(endpoint, body, options = {}) {
  return safeApiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE 요청 전용 함수
 */
async function apiDelete(endpoint, options = {}) {
  return safeApiCall(endpoint, { method: "DELETE", ...options });
}

export { safeApiCall, apiGet, apiPost, apiPut, apiDelete, checkBackendHealth };
