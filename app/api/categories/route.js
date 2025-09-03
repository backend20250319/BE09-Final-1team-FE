import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/config";

export async function GET(request) {
  try {
    // 카테고리 목록은 공개 데이터이므로 인증 불필요
    console.log("🔍 categories API: 공개 카테고리 목록 요청");

    // 백엔드 API로 카테고리 목록 요청 (인증 불필요)
    const backendUrl = getBackendUrl("api/users/categories");
    console.log("🔍 백엔드 요청 URL:", backendUrl);

    const apiResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("🔍 백엔드 API 응답 상태:", apiResponse.status);

    if (!apiResponse.ok) {
      throw new Error(`백엔드 API 오류: ${apiResponse.status}`);
    }

    const categoriesData = await apiResponse.json();
    console.log("🔍 백엔드에서 받은 카테고리 데이터:", categoriesData);

    return NextResponse.json({
      success: true,
      data: categoriesData.data || categoriesData,
    });
  } catch (error) {
    console.error("🚨 카테고리 API 오류:", error);

    // 개발 환경에서 백엔드가 없는 경우 임시 데이터 반환
    if (
      process.env.NODE_ENV === "development" &&
      (error.code === "ECONNREFUSED" || error.message.includes("fetch"))
    ) {
      console.warn("⚠️ 백엔드 연결 실패, 기본 카테고리 데이터 사용");
      return NextResponse.json({
        success: true,
        data: [
          { categoryCode: "POLITICS", icon: "🏛️", categoryName: "정치" },
          { categoryCode: "ECONOMY", icon: "💰", categoryName: "경제" },
          { categoryCode: "SOCIETY", icon: "👥", categoryName: "사회" },
          { categoryCode: "LIFE", icon: "🎭", categoryName: "생활" },
          { categoryCode: "INTERNATIONAL", icon: "🌍", categoryName: "세계" },
          { categoryCode: "IT_SCIENCE", icon: "💻", categoryName: "IT/과학" },
          { categoryCode: "VEHICLE", icon: "🚗", categoryName: "자동차/교통" },
          {
            categoryCode: "TRAVEL_FOOD",
            icon: "🧳",
            categoryName: "여행/음식",
          },
          { categoryCode: "ART", icon: "🎨", categoryName: "예술" },
        ],
      });
    }

    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
