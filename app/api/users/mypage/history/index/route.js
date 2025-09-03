import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/config";

export async function GET(request) {
  try {
    // 쿠키에서 인증 토큰 추출
    const cookies = request.headers.get("cookie");
    console.log("🔍 history API: 받은 쿠키:", cookies);

    if (!cookies) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";
    const sort = searchParams.get("sort") || "updatedAt,DESC";

    // 백엔드 API로 읽기 기록 요청
    const backendUrl = getBackendUrl(
      `api/users/mypage/history/index?page=${page}&size=${size}&sort=${sort}`
    );

    console.log("🔍 백엔드 요청 URL:", backendUrl);

    const apiResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies, // 클라이언트의 쿠키를 백엔드로 전달
      },
      credentials: "include",
    });

    console.log("🔍 백엔드 API 응답 상태:", apiResponse.status);

    if (!apiResponse.ok) {
      if (apiResponse.status === 401) {
        return NextResponse.json(
          { success: false, message: "인증이 만료되었습니다." },
          { status: 401 }
        );
      }
      throw new Error(`백엔드 API 오류: ${apiResponse.status}`);
    }

    const historyData = await apiResponse.json();
    console.log("🔍 백엔드에서 받은 읽기 기록 데이터:", historyData);

    return NextResponse.json({
      success: true,
      data: historyData.data || historyData,
    });
  } catch (error) {
    console.error("🚨 읽기 기록 API 오류:", error);

    // 개발 환경에서 백엔드가 없는 경우 임시 데이터 반환
    if (
      process.env.NODE_ENV === "development" &&
      (error.code === "ECONNREFUSED" || error.message.includes("fetch"))
    ) {
      console.warn("⚠️ 백엔드 연결 실패, 임시 데이터 사용");
      return NextResponse.json({
        success: true,
        data: {
          content: [
            {
              newsId: 1,
              newsTitle: "테스트 뉴스 1 (백엔드 미연결)",
              categoryName: "정치",
              updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
            },
            {
              newsId: 2,
              newsTitle: "테스트 뉴스 2 (백엔드 미연결)",
              categoryName: "사회",
              updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2시간 전
            },
          ],
          totalElements: 2,
          totalPages: 1,
          page: 0,
          size: 10,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
