// 권한 관리 유틸리티 함수들 (JWT 토큰 기반)

// 토큰 저장 함수
export function setTokens(accessToken, refreshToken) {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

// AccessToken 가져오기
export function getAccessToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
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
    const response = await fetch('/api/auth/login', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // JWT 토큰 저장 (data 객체 안에 있음)
      setTokens(data.data.accessToken, data.data.refreshToken);

      // 사용자 정보 저장 (data 객체 안에 있음)
      setUserInfo(data.data.user);

      return {
        success: true,
        role: data.data.user.role.toLowerCase(), // "USER" -> "user"로 변환
        user: data.data.user,
      };
    } else {
      return {
        success: false,
        message: data.message || "로그인에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("로그인 오류:", error);
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
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 인증이 필요한 API 요청 함수
export async function authenticatedFetch(url, options = {}) {
  let token = getAccessToken();

  // 토큰이 없으면 에러 반환
  if (!token) {
    return { success: false, message: "인증이 필요합니다." };
  }

  // 첫 번째 요청 시도
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders(),
    },
  });

  // 401 오류 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshResult = await refreshAccessToken();

    if (refreshResult.success) {
      // 갱신된 토큰으로 재요청
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...getAuthHeaders(),
        },
      });
    } else {
      // 갱신 실패 시 로그인 페이지로 이동
      logout();
      return { success: false, message: "세션이 만료되었습니다." };
    }
  }

  return response;
}
