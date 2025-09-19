import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// /api/analytics/news-click - 뉴스 클릭 추적
export async function POST(request) {
  try {
    const accessToken = cookies().get("access-token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { newsId, userId, newsletterId, timestamp } = await request.json();
    
    // 백엔드 API로 클릭 추적 요청
    const backendUrl = getApiUrl('/api/analytics/news-click');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        newsId,
        userId,
        newsletterId,
        timestamp: timestamp || new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('클릭 추적 실패:', error);
    return NextResponse.json({ error: '클릭 추적 실패' }, { status: 500 });
  }
}
