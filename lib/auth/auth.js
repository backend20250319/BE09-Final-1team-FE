import { v4 as uuidv4 } from "uuid";

// --- 사용자 정보 관리 (localStorage) ---
// ✅ 사용자 정보는 UI 표시 등을 위해 localStorage에 계속 저장합니다.

export function setUserInfo(userInfo) {
  if (typeof window !== "undefined") {
    console.log("💾 setUserInfo 호출:", userInfo);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    console.log("💾 localStorage 저장 완료:", localStorage.getItem("userInfo"));
    // 사용자 정보 변경 시 커스텀 이벤트 발생
    console.log("🔔 authStateChanged 이벤트 발생");
    window.dispatchEvent(new CustomEvent("authStateChanged"));
  }
}

export function getUserInfo() {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo");
    const parsed = userInfo ? JSON.parse(userInfo) : null;
    console.log("🔍 getUserInfo 호출:", { raw: userInfo, parsed: parsed });
    return parsed;
  }
  return null;
}

// ✅ 사용자 역할 가져오기
export function getUserRole() {
  const userInfo = getUserInfo();
  console.log("🔍 getUserRole 호출:", {
    userInfo,
    keys: userInfo ? Object.keys(userInfo) : null,
    role: userInfo?.role,
    userRole: userInfo?.userRole,
    authorities: userInfo?.authorities,
    roles: userInfo?.roles,
  });

  // 다양한 가능한 role 필드명 확인
  const role =
    userInfo?.role ||
    userInfo?.userRole ||
    userInfo?.authorities?.[0] ||
    userInfo?.roles?.[0] ||
    (userInfo ? "user" : null); // 사용자 정보가 있으면 기본값 "user"

  console.log("🔍 최종 role:", role);
  return role;
}

// ✅ 로그인 상태는 이제 토큰이 아닌, localStorage의 사용자 정보 유무로 판단합니다.
export function isAuthenticated() {
  return getUserInfo() !== null;
}

// ✅ 관리자 여부도 저장된 사용자 정보로 판단합니다.
export function isAdmin() {
  const userInfo = getUserInfo();
  return userInfo?.role?.toLowerCase() === "admin";
}

// --- 인증 상태 관리 ---

// ✅ 로그아웃 함수: 백엔드에 쿠키 삭제를 요청합니다.
export async function logout(redirect = true) {
  try {
    // 백엔드에 로그아웃을 요청하여 HttpOnly 쿠키를 삭제하도록 합니다.
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // ✅ 쿠키를 보내기 위한 필수 옵션
    });
  } catch (error) {
    console.error("Logout API 호출 실패:", error);
  } finally {
    // API 호출 성공 여부와 관계없이 프론트엔드 데이터는 모두 정리합니다.
    if (typeof window !== "undefined") {
      localStorage.removeItem("userInfo");
      // 로그아웃 시 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent("authStateChanged"));

      // redirect 파라미터가 true일 때만 리다이렉트 수행
      if (redirect) {
        window.location.href = "/auth";
      }
    }
  }
}

/**
 * 인증이 필요한 API 요청을 위한 fetch 래퍼 함수
 * 1. 모든 요청에 `credentials: 'include'` 옵션을 추가하여 쿠키를 자동 전송
 * 2. 401 에러 발생 시 자동으로 토큰 갱신 API를 호출하고, 성공하면 원래 요청을 재시도
 */
export async function authenticatedFetch(url, options = {}) {
  try {
    console.log("🔍 authenticatedFetch 호출:", {
      url,
      method: options.method || 'GET',
      hasCredentials: true
    });

    // 첫 번째 요청 시도
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    console.log("📡 authenticatedFetch 응답:", {
      url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 401 에러(Access Token 만료)가 발생하면 토큰 갱신 시도
    if (response.status === 401) {
      console.log("🔄 Access Token 만료. 토큰 갱신을 시도합니다.");
      
      try {
        // 토큰 갱신 API 호출
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          console.log("✅ 토큰 갱신 성공. 원래 요청을 재시도합니다.");
          
          // 원래 요청을 재시도
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...options.headers,
            },
            credentials: "include",
          });

          console.log("🔄 재시도 응답:", {
            url,
            status: retryResponse.status,
            statusText: retryResponse.statusText
          });

          return retryResponse;
        } else {
          console.log("❌ 토큰 갱신 실패. 로그아웃 처리합니다.");
          throw new Error("토큰 갱신 실패");
        }
      } catch (refreshError) {
        console.log("❌ 토큰 갱신 중 오류 발생:", refreshError);
        
        // 응답 본문도 확인해보기
        try {
          const responseText = await response.text();
          console.log("❌ 401 응답 본문:", responseText);
        } catch (e) {
          console.log("❌ 401 응답 본문 읽기 실패:", e);
        }
        
        // 사용자에게 알림을 표시할 수 있도록 커스텀 이벤트 발생
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sessionExpired", {
            detail: { message: "세션이 만료되었습니다. 다시 로그인해주세요." }
          }));
        }
        
        logout(false); // 자동 리다이렉트 하지 않음
        // 에러를 발생시켜 Promise 체인을 중단시킵니다.
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
      }
    }

    return response;
  } catch (error) {
    console.error("🚨 authenticatedFetch 오류:", error);
    // 발생한 에러를 그대로 호출한 곳으로 전파하여 처리할 수 있도록 합니다.
    throw error;
  }
}

// --- 일반 로그인 및 디바이스 ID (이 함수들은 기존과 거의 동일하게 유지) ---

export async function login(email, password) {
  try {
    const deviceId = getDeviceId();
    if (!deviceId) {
      throw new Error("디바이스 ID를 생성할 수 없습니다.");
    }

    // ✅ 먼저 Next.js API route에서 유효성 검사 수행
    console.log("🔍 로그인 유효성 검사 시작:", { email, deviceId });
    
    const validationResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceId }),
    });

    console.log("🔍 유효성 검사 응답 상태:", {
      status: validationResponse.status,
      statusText: validationResponse.statusText,
      ok: validationResponse.ok
    });

    let validationData;
    try {
      validationData = await validationResponse.json();
      console.log("🔍 유효성 검사 응답 데이터:", validationData);
    } catch (parseError) {
      console.error("❌ 유효성 검사 응답 JSON 파싱 실패:", parseError);
      const errorText = await validationResponse.text();
      console.error("❌ 유효성 검사 응답 원본:", errorText);
      
      // 백엔드 서버 연결 실패인 경우
      if (validationResponse.status === 503 || errorText.includes("백엔드 서버")) {
        throw new Error("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      }
      
      throw new Error("서버 응답 형식이 올바르지 않습니다.");
    }

    // 유효성 검사 실패 시 에러 반환
    if (!validationResponse.ok || !validationData.success) {
      console.error("❌ 유효성 검사 실패:", validationData);
      throw new Error(
        validationData.message || validationData.error || "로그인 데이터가 올바르지 않습니다."
      );
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // httpOnly 쿠키를 받기 위해 추가
      body: JSON.stringify({ email, password, deviceId }),
    });

    let data;
    try {
      data = await response.json();
      console.log("🔍 백엔드 로그인 응답:", data);
    } catch (parseError) {
      console.error("❌ 로그인 응답 JSON 파싱 실패:", parseError);
      const errorText = await response.text();
      console.error("❌ 로그인 응답 원본:", errorText);
      throw new Error("서버 응답 형식이 올바르지 않습니다.");
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "로그인에 실패했습니다.");
    }

    // 로그인 성공 시 백엔드는 HttpOnly 쿠키를 응답 헤더에 담아 보냅니다.
    // 여기서는 사용자 정보만 localStorage에 저장합니다.
    const userData = data.data?.user || data.user || data.data;
    console.log("🔐 추출된 사용자 데이터:", userData);

    if (userData) {
      console.log("🔐 로그인 성공, 사용자 정보 저장:", userData);
      setUserInfo(userData);
      console.log("🔐 localStorage 저장 후:", localStorage.getItem("userInfo"));
    } else {
      console.error("❌ 사용자 정보를 찾을 수 없습니다:", data);
      throw new Error("사용자 정보를 받지 못했습니다.");
    }

    return {
      success: true,
      role: userData?.role?.toLowerCase() || "user", // role 추가
      user: userData,
    };
  } catch (error) {
    console.error("🚨 로그인 함수 오류:", error);
    // 에러 메시지를 포함하여 반환
    return { success: false, message: error.message };
  }
}

export function getDeviceId() {
  if (typeof window === "undefined") return null;

  const DEVICE_ID_KEY = "app_device_id";
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
