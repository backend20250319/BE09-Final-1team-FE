import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// JWT 토큰 디코딩 함수 (middleware에서 사용)
function decodeJWT(token: string) {
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
function getRoleFromToken(token: string) {
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded?.role || decoded?.userRole || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // admin 경로에 대한 권한 체크
  if (pathname.startsWith("/admin")) {
    // 쿠키에서 accessToken 확인
    const accessToken = request.cookies.get("accessToken")?.value;

    console.log("🔍 Admin 접근 시도:", pathname);
    console.log("🔍 AccessToken 존재:", !!accessToken);

    if (!accessToken) {
      console.log("❌ 토큰이 없어서 리다이렉트");
      // 토큰이 없으면 unauthorized 페이지로 리다이렉트
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // JWT 토큰에서 role 추출
    const role = getRoleFromToken(accessToken);
    console.log("🔍 추출된 role:", role);

    // role이 admin이 아니면 unauthorized 페이지로 리다이렉트
    // 대소문자 구분 없이 비교
    if (role?.toLowerCase() !== "admin") {
      console.log(`❌ 권한 부족 (role: ${role}), unauthorized로 리다이렉트`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    console.log("✅ Admin 권한 확인됨, 접근 허용");
  }

  return NextResponse.next();
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
};
