import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/config";

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // 쿠키에서 토큰 가져오기
    const cookies = request.headers.get("cookie");
    let cookieToken = null;
    if (cookies) {
      const tokenMatch = cookies.match(/access_token=([^;]+)/);
      if (tokenMatch) {
        cookieToken = tokenMatch[1];
        console.log("🍪 관리자 삭제 API: 쿠키 토큰 확인됨");
      }
    }

    if (!cookieToken) {
      console.log("❌ 관리자 삭제 API: 인증 토큰이 없음");
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 백엔드로 삭제 요청
    const backendApiUrl = getBackendUrl(`api/users/internal/admin/${id}`);
    const response = await fetch(backendApiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${cookieToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`📡 사용자 ${id} 삭제 API 백엔드 응답:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("❌ 사용자 삭제 API 백엔드 오류:", errorData);
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "사용자 삭제에 실패했습니다.",
        },
        { status: response.status }
      );
    }

    // 삭제 성공
    const data = await response.json().catch(() => ({ success: true }));
    console.log(`✅ 사용자 ${id} 삭제 성공`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("사용자 삭제 API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
