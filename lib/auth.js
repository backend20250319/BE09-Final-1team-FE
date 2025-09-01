// 권한 관리 유틸리티 함수들 (JWT 토큰 기반)

// JWT 토큰 디코딩 함수 (Base64 디코딩)
export function decodeJWT(token) {
  try {
    // JWT는 header.payload.signature 형태로 구성됨
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // payload 부분 디코딩 (Base64)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("JWT 디코딩 오류:", error);
    return null;
  }
}

// 토큰에서 사용자 role 추출
export function getRoleFromToken(token) {
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded?.role || decoded?.userRole || null;
}

// 토큰 저장 함수
export function setTokens(accessToken, refreshToken) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // 미들웨어에서 접근할 수 있도록 accessToken을 쿠키에도 저장
    // 개발 환경에서는 secure 옵션 제거
    const isProduction = window.location.protocol === "https:";
    const secureOption = isProduction ? "; secure" : "";
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; samesite=strict${secureOption}`;

    console.log("🔍 토큰 저장됨 - AccessToken:", accessToken);
    console.log(
      "🔍 쿠키 설정:",
      `accessToken=${accessToken}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; samesite=strict${secureOption}`
    );
  }
}

// AccessToken 가져오기
export function getAccessToken() {
  if (typeof window !== "undefined") {
    return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    null
    );
  }
  return null;
}

// RefreshToken 가져오기
export function getRefreshToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

// 토큰 삭제 함수
export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");

    // 쿠키에서도 토큰 삭제
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}

// 사용자 정보 저장 함수
export function setUserInfo(userInfo) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    localStorage.setItem("userRole", userInfo.role);
  }
}

// 사용자 정보 가져오기
export function getUserInfo() {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }
  return null;
}

// 사용자 역할 가져오기
export function getUserRole() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userRole");
  }
  return null;
}

// 인증 상태 확인
export function isAuthenticated() {
  return getAccessToken() !== null;
}

// 관리자 권한 체크
export function isAdmin() {
  return getUserRole() === "admin";
}

// 일반 사용자 권한 체크
export function isUser() {
  const role = getUserRole();
  return role === "user" || role === "admin"; // admin도 user 권한을 가짐
}

// 토큰 갱신 함수
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return { success: false, message: "리프레시 토큰이 없습니다." };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      setTokens(data.accessToken, data.refreshToken);
      return { success: true, accessToken: data.accessToken };
    } else {
      // 리프레시 토큰도 만료된 경우 로그아웃
      clearTokens();
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("토큰 갱신 오류:", error);
    clearTokens();
    return { success: false, message: "토큰 갱신 중 오류가 발생했습니다." };
  }
}

// 로그인 함수
export async function login(email, password) {
  try {
    console.log("🔐 로그인 함수 호출:", { email, password: "***" });
    
    const response = await fetch('/api/auth/login', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("📡 API 응답 상태:", response.status);
    
    const data = await response.json().catch((err) => {
      console.error("JSON 파싱 오류:", err);
      return {};
    });

    console.log("📦 API 응답 데이터:", data);

    if (response.ok && data.success) {
      console.log("✅ 로그인 성공, 토큰 저장 중...");
      
      // JWT 토큰 저장 (data 객체 안에 있음)
      setTokens(data.data.accessToken, data.data.refreshToken);

      // 사용자 정보 저장 (data 객체 안에 있음)
      setUserInfo(data.data.user);

      console.log("💾 사용자 정보 저장됨:", data.data.user);

      return {
        success: true,
        role: data.data.user.role.toLowerCase(), // "USER" -> "user"로 변환
        user: data.data.user,
      };
    } else {
      console.log("❌ 로그인 실패:", data.message);
      return {
        success: false,
        message: data.message || "로그인에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("🚨 로그인 함수 오류:", error);
    return { success: false, message: "로그인 중 오류가 발생했습니다." };
  }
}

// 로그아웃 함수
export function logout() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/auth";
  }
}

// API 요청에 사용할 인증 헤더 생성
export function getAuthHeaders() {
  const token = getAccessToken();
  
  // 개발 환경에서 테스트용 토큰 사용
  if (!token && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔧 개발 환경에서 테스트 토큰 사용');
    return { Authorization: 'Bearer test-token' };
  }
  
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 인증이 필요한 API 요청 함수
export async function authenticatedFetch(url, options = {}) {
  try {
    let token = getAccessToken();

    // 토큰이 없으면 에러 반환
    if (!token) {
      console.warn("🔑 인증 토큰이 없습니다.");
      return { success: false, message: "인증이 필요합니다." };
    }

    // URL 유효성 검사
    if (!url || typeof url !== 'string') {
      console.error("❌ 잘못된 URL:", url);
      return { success: false, message: "잘못된 API URL입니다." };
    }

    console.log("🌐 API 요청 시작:", url);

    // 첫 번째 요청 시도
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeaders(),
      },
    });

    console.log("📡 API 응답 상태:", response.status);

    // 401 오류 시 토큰 갱신 시도
    if (response.status === 401) {
      console.log("🔄 토큰 갱신 시도 중...");
      const refreshResult = await refreshAccessToken();

      if (refreshResult.success) {
        console.log("✅ 토큰 갱신 성공, 재요청 중...");
        // 갱신된 토큰으로 재요청
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...getAuthHeaders(),
          },
        });
        console.log("📡 재요청 응답 상태:", response.status);
      } else {
        console.log("❌ 토큰 갱신 실패, 로그아웃 처리");
        // 갱신 실패 시 로그인 페이지로 이동
        logout();
        return { success: false, message: "세션이 만료되었습니다." };
      }
    }

    return response;
  } catch (error) {
    console.error("🚨 authenticatedFetch 오류:", error);
    
    // 네트워크 오류인지 확인
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { 
        success: false, 
        message: "네트워크 연결을 확인해주세요. 서버가 실행 중인지 확인하세요." 
      };
    }
    
    return { 
      success: false, 
      message: "요청 중 오류가 발생했습니다: " + error.message 
    };
  }
}
