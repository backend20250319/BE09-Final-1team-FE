// 권한 관리 유틸리티 함수들
import { getApiUrl } from './config'

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

// 로그인 함수
export async function login(email, password) {
  try {
    const response = await fetch(getApiUrl('auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      setUserRole(data.user.role)
      return { success: true, role: data.user.role }
    } else {
      return { success: false, message: data.message }
    }
  } catch (error) {
    console.error('로그인 오류:', error)
    return { success: false, message: "로그인 중 오류가 발생했습니다." }
  }
}

// 로그아웃 함수
export function logout() {
  clearUserRole()
  // 구독 상태도 초기화
  if (typeof window !== "undefined") {
    localStorage.removeItem('subscribed')
    window.location.href = "/"
  }
} 