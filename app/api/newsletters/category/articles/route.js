import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit") || 5;

    console.log("🔍 카테고리별 기사 조회 요청:", { category, limit });

    if (!category) {
      return Response.json(
        { success: false, error: "카테고리가 필요합니다." },
        { status: 400 }
      );
    }

    // 카테고리 매핑
    const categoryMapping = {
      정치: "POLITICS",
      경제: "ECONOMY",
      사회: "SOCIETY",
      생활: "LIFE",
      세계: "INTERNATIONAL",
      "IT/과학": "IT_SCIENCE",
      "자동차/교통": "VEHICLE",
      "여행/음식": "TRAVEL_FOOD",
      예술: "ART",
    };

    const backendCategory = categoryMapping[category] || category;

    // 쿠키에서 토큰 가져오기 (Next.js 방식)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    if (!accessToken) {
      console.log("❌ 인증 토큰이 없음");
      // 기본 데이터 반환
      return Response.json({
        success: true,
        data: {
          trendingKeywords: [],
          totalArticles: 0,
          articles: [],
          mainTopics: [],
        },
      });
    }

    const backendUrl = `${
      process.env.BACKEND_URL || "http://localhost:8000"
    }/api/news/category/${backendCategory}/articles?limit=${limit}`;

    // 백엔드 API 호출
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ 백엔드 에러:", response.status);
      // 기본 데이터 반환
      return Response.json({
        success: true,
        data: {
          trendingKeywords: [],
          totalArticles: 0,
          articles: [],
          mainTopics: [],
        },
      });
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error("🚨 카테고리별 기사 조회 실패:", error);
    return Response.json({
      success: true,
      data: {
        trendingKeywords: [],
        totalArticles: 0,
        articles: [],
        mainTopics: [],
      },
    });
  }
}