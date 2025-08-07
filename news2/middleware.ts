import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // admin 경로에 대한 권한 체크
  if (pathname.startsWith("/admin")) {
    // 쿠키에서 role 확인 (실제 구현에서는 JWT 토큰을 사용하는 것을 권장)
    const role = request.cookies.get("userRole")?.value
    
    // role이 admin이 아니면 unauthorized 페이지로 리다이렉트
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
} 