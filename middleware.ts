import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ❌ JWT를 직접 다루던 함수들은 더 이상 필요 없으므로 모두 삭제합니다.
// function decodeJWT(token: string) { ... }
// function getRoleFromToken(token: string) { ... }

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로들 정의
  const protectedPaths = ["/admin", "/mypage"];

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // ✅ HttpOnly 쿠키의 존재 여부 확인 - 실제 쿠키 이름은 'access-token'
    const accessTokenCookie = request.cookies.get("access-token")?.value;

    if (!accessTokenCookie) {
      console.log(
        `❌ [Middleware] '${pathname}' 접근에 인증 쿠키가 없어 로그인 페이지로 리디렉션합니다.`
      );
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // ✅ 쿠키가 존재하면, 일단 페이지 접근을 허용합니다.
    console.log(
      `✅ [Middleware] '${pathname}' 접근에 access-token 쿠키가 확인되어 접근을 허용합니다.`
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
