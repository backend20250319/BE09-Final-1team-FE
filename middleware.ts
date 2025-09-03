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
    // ✅ HttpOnly 쿠키의 존재 여부만 확인합니다. 백엔드와 통일된 쿠키 이름은 'access_token'입니다.
    const accessTokenCookie = request.cookies.get("access_token")?.value;

    if (!accessTokenCookie) {
      console.log(
        `❌ [Middleware] '${pathname}' 접근에 인증 쿠키가 없어 로그인 페이지로 리디렉션합니다.`
      );
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // ✅ 쿠키가 존재하면, 일단 페이지 접근을 허용합니다.
    //    /admin 페이지의 실제 권한 검증은 해당 페이지가 데이터를 요청하는 API 호출 시
    //    게이트웨이와 백엔드에서 처리하므로, 프론트엔드 미들웨어에서는 검사할 필요가 없습니다.
    console.log(
      `✅ [Middleware] '${pathname}' 접근에 인증 쿠키가 확인되어 접근을 허용합니다.`
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
