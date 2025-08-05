// 권한 관리 유틸리티 함수들

// 쿠키 설정 함수
export function setUserRole(role) {
  if (typeof window !== "undefined") {
    // 쿠키 설정 (7일간 유효)
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    document.cookie = `userRole=${role}; expires=${expires.toUTCString()}; path=/`
  }
}

// 쿠키에서 role 가져오기
export function getUserRole() {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";")
    const roleCookie = cookies.find(cookie => cookie.trim().startsWith("userRole="))
    return roleCookie ? roleCookie.split("=")[1] : null
  }
  return null
}

// 쿠키 삭제 함수
export function clearUserRole() {
  if (typeof window !== "undefined") {
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  }
}

// 관리자 권한 체크
export function isAdmin() {
  return getUserRole() === "admin"
}

// 일반 사용자 권한 체크
export function isUser() {
  const role = getUserRole()
  return role === "user" || role === "admin" // admin도 user 권한을 가짐
}

// 로그인 함수 (실제 구현에서는 API 호출)
export function login(email, password) {
  // 간단한 예시 - 실제로는 API 호출
  if (email === "admin@example.com" && password === "admin123") {
    setUserRole("admin")
    return { success: true, role: "admin" }
  } else if (email === "user@example.com" && password === "user123") {
    setUserRole("user")
    return { success: true, role: "user" }
  } else {
    return { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." }
  }
}

// 로그아웃 함수
export function logout() {
  clearUserRole()
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
} 