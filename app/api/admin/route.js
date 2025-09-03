import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/config";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "10";

  try {
    // 쿠키에서 토큰 가져오기
    const cookies = request.headers.get("cookie");
    let cookieToken = null;
    if (cookies) {
      const tokenMatch = cookies.match(/access_token=([^;]+)/);
      if (tokenMatch) {
        cookieToken = tokenMatch[1];
        console.log("🍪 관리자 API: 쿠키 토큰 확인됨");
      }
    }

    if (!cookieToken) {
      console.log("❌ 관리자 API: 인증 토큰이 없음");
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 백엔드로 프록시 요청
    const backendApiUrl = getBackendUrl(
      `api/users/internal/admin?page=${page}&size=${size}`
    );
    const response = await fetch(backendApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookieToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 관리자 API 백엔드 응답:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("❌ 관리자 API 백엔드 오류:", errorData);
      return NextResponse.json(
        {
          success: false,
          message:
            errorData.message || "관리자 정보를 가져오는데 실패했습니다.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ 관리자 API 성공:", data.data?.totalElements || 0, "명");

    return NextResponse.json(data);
  } catch (error) {
    console.error("관리자 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
